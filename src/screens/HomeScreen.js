import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { useUser } from "../context/UserContext";
import HabitPopUp from '../components/HabitPopUp';
import { listenUserByEmail, listenActividades } from "../db/userQueries";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from "../firebase";

const meses = {
  0: "enero",
  1: "febrero",
  2: "marzo",
  3: "abril",
  4: "mayo",
  5: "junio",
  6: "julio",
  7: "agosto",
  8: "septiembre",
  9: "octubre",
  10: "noviembre",
  11: "diciembre",
}


export default function HomeScreen({ navigation }) {
  const { email } = useUser();
  const [usuario, setUsuario] = useState(null);
  const [act, setAct] = useState([]);
  const [popUpVisible, setPopUpVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const activitiesUnsubRef = useRef(null);

  let date = new Date();
  const dateAct = date.getDate() + " " + date.getMonth();

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    const unsubscribeUser = listenUserByEmail(email, async (userData) => {
      setUsuario(userData);

      // limpia los listeners previos
      if (activitiesUnsubRef.current) {
        try {
          activitiesUnsubRef.current();
        } catch (e) {
          // ignore
        }
        activitiesUnsubRef.current = null;
      }

      const actividadIds = userData?.actividades || [];
      if (actividadIds.length === 0) {
        setAct([]);
        setLoading(false);
        return;
      }

      // escucha cada hábito
      activitiesUnsubRef.current = listenActividades(actividadIds, (updatedActivities) => {
        setAct(updatedActivities);
        setLoading(false);
      });
    });

    return () => {
      try {
        unsubscribeUser();
      } catch (e) {
        // ignore
      }
      if (activitiesUnsubRef.current) {
        try {
          activitiesUnsubRef.current();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [email]);

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

  const completeHabit = async (cantidad) => {
    // Aquí va la lógica para marcar el hábito como completado
    if (selectedHabit.fecha == dateAct) {
      console.log("Este hábito ya se ha completado");
      closePopUp();
      return;
    }
    console.log('Hábito completado con ID:', selectedHabit.id);
    const actividadRef = doc(db, 'Actividades', selectedHabit.id);
    await updateDoc(actividadRef, {
      fecha: dateAct
    });
    let fecha = new Date();
    const mes = meses[fecha.getMonth()];
    if (!cantidad) {
      cantidad = 1;
    }
    if (!selectedHabit[mes]) {
      await updateDoc(actividadRef, {
        [mes]: 1
      });
    } else {
      await updateDoc(actividadRef, {
        [mes]: selectedHabit[mes] + 1,
      });
    }
    console.log(mes);
    if (selectedHabit.trackingType == 'binary') {
      try {
        let datos_mes = []
        if (!selectedHabit.ultimo_mes) {
          datos_mes = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        } else {
          datos_mes = selectedHabit.ultimo_mes;
        }
        datos_mes.shift();
        datos_mes.push(1);
        console.log(datos_mes);
        await updateDoc(actividadRef, {
          ultimo_mes: datos_mes
        });
      } catch (e) {
          console.log(e);
      }
    } else {
      try {
        let datos_mes = []
        if (!selectedHabit.ultimo_mes) {
          datos_mes = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        } else {
          datos_mes = selectedHabit.ultimo_mes;
        }
        datos_mes.shift();
        datos_mes.push(parseInt(cantidad));
        console.log(datos_mes);
        await updateDoc(actividadRef, {
          //[dia]: 1,
          ultimo_mes: datos_mes
        });
      } catch (e) {
          console.log(e);
      }
    }
    closePopUp();
  };

  return (
    <View style={styles.container}>

      {act.length === 0 ? (
        console.log("actividades vacio"),
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
            console.log("item");
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
    fontSize: 24,
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
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    width: '100%',
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
  },
  graphText: { color: "rgba(255,255,255,0.9)", fontSize: 12 },
  activityBox: {
    width: '90%',
    height: 175,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    // efecto de sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // efecto de elevación para Android
    elevation: 3,
  },
  icono: {
    fontSize: 24,
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
  },
});
