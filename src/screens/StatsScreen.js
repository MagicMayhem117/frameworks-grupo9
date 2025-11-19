import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import firebaseConfig from "../keys.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const StatsScreen = ({ navigation }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    // ✅ Escucha en tiempo real los hábitos del usuario autenticado
    const q = query(
      collection(db, "Actividades"),
      where("usuario_id", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setHabits(data);
        setLoading(false);
      },
      (error) => {
        console.error("onSnapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando tus hábitos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus Hábitos</Text>

      {habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.noHabits}>Aún no has creado hábitos.</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CrateHabitScreen")}
          >
            <Text style={styles.addText}>＋ Crear nuevo hábito</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.card, { borderLeftColor: item.color || "#4f46e5" }]}>
                <Text style={styles.icon}>{item.icon || "🔔"}</Text>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.details}>
                    {item.trackingType === "quantitative"
                      ? `${item.goal} ${item.unit} diarios`
                      : "Completado (Sí/No)"}
                  </Text>
                </View>
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CreateHabit")}
          >
            <Text style={styles.addText}>＋ Crear nuevo hábito</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#111827" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    borderLeftWidth: 5,
    marginBottom: 12,
    padding: 12,
  },
  icon: { fontSize: 28, marginRight: 10 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: "600" },
  details: { fontSize: 14, color: "#6b7280" },
  addButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  addText: { color: "white", fontWeight: "700", fontSize: 16 },
  noHabits: { textAlign: "center", color: "#6b7280", fontSize: 16, marginBottom: 10 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#4f46e5" },
});

export default StatsScreen;
