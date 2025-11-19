import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import HabitPopUp from '../components/HabitPopUp';
import { getUserByEmail, getActividades } from "../db/userQueries";
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from "../firebase";


export default function HomeScreen({ navigation }) {
  const { email } = useUser();
  const [usuario, setUsuario] = useState(null);
  const [act, setAct] = useState([]);
  const [popUpVisible, setPopUpVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth().currentUser;

  let date = new Date();
  const dateAct = date.getDate() + " " + date.getMonth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "Actividades"),
      where("usuario_id", "==", user.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActivities(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener actividades:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 8 }}>Cargando actividades...</Text>
      </View>
    );
  }


  const openPopUp = (habit) => {
    setSelectedHabit(habit);
    setPopUpVisible(true);
  };

  const closePopUp = () => {
    setSelectedHabit(null);
    setPopUpVisible(false);
  };

  const completeHabit = async () => {
    // Aquí va la lógica para marcar el hábito como completado
    console.log(dateAct);
    console.log('Hábito completado con ID:', selectedHabit.id);
    const actividadRef = doc(db, 'Actividades', selectedHabit.id);
    await updateDoc(actividadRef, {
      fecha: dateAct
    });
    closePopUp();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tus Actividades</Text>

      {act.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: "#6b7280", marginBottom: 10 }}>
            Aún no tienes actividades
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("Agregar")}
          >
            <Text style={styles.addText}>＋ Crear nueva actividad</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={act}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16, width: '100%', alignItems: 'left' }}
          renderItem={({ item }) => {
            const bg = item.color || '#4a90e2';
            const reg = (dateAct == item.fecha) ? '#4df358ff' : '#ef4444';
            const title = item.nombre || item.name || 'Actividad';
            return (
              <TouchableOpacity
                style={[styles.activityBox, { backgroundColor: bg }]}
                onPress={() => openPopUp(item)}
              >
                <View style={styles.activityHeader}>
                  <Text style={styles.icono}>{item.icon}</Text>
                  <Text style={styles.activityTitle}>{title}</Text>
                  <View style={[styles.dispDisplay, {backgroundColor: reg}]}>
                    <Text style={styles.disp}>{(dateAct == item.fecha) ? "Registrada" : "No Registrada"}</Text>
                  </View>
                </View>
                {/* Lugar para poner una gráfica */}
                <View style={styles.graphPlaceholder} />
              </TouchableOpacity>
            );
          }}
          /*renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.activityCard,
                { backgroundColor: item.color || "#4f46e5" },
              ]}
              onPress={() =>
                navigation.navigate("ActivityDetailScreen", { activity: item })
              }
            >
              <View style={styles.activityHeader}>
                <Text style={styles.icon}>{item.icon || "🔥"}</Text>
                <Text style={styles.activityName}>{item.name}</Text>
              </View>
              <View style={styles.graphPlaceholder}>
                <Text style={styles.graphText}>Gráfica de progreso</Text>
              </View>
            </TouchableOpacity>
          )}*/
        />
      )}
      <HabitPopUp
        visible={popUpVisible}
        habit={selectedHabit}
        onClose={closePopUp}
        onComplete={completeHabit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  addButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  addText: { color: "#fff", fontWeight: "700" },
  activityCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  disp: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dispDisplay: {
    backgroundColor: '#4df358ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 8,
  },
  icon: {
    fontSize: 26,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    padding: 6,
    borderRadius: 8,
  },
  activityName: { color: "#fff", fontWeight: "700", fontSize: 18 },
  graphPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.3)",
    height: 60,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  graphText: { color: "rgba(255,255,255,0.9)", fontSize: 12 },
});
