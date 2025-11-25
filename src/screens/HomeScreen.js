import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { useUser } from "../context/UserContext";
import HabitPopUp from '../components/HabitPopUp';
import { listenUserByEmail, listenActividades } from "../db/userQueries";
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from "../firebase";
import { LineChart, BarChart } from "react-native-gifted-charts";

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
const diasMeses = {
  0: 31,
  1: 28,
  2: 31,
  3: 30,
  4: 31,
  5: 30,
  6: 31,
  7: 31,
  8: 30,
  9: 31,
  10: 30,
  11: 31,
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

    // Aquí va la lógica para marcar el hábito como completado
    /*if (selectedHabit.fecha == dateAct) {
      Alert.alert("Completo", "Este hábito ya se ha completado");
      closePopUp();
      return;
    }*/
    const completeHabit = async (cantidad = 1) => {
      if (!selectedHabit) return;

      if (selectedHabit.isGroupActivity && selectedHabit.status !== "active") {
          Alert.alert("Pendiente", "Esta actividad grupal aún está pendiente de respuesta.");
          closePopUp();
          return;
        }

      try {
        const actividadRef = doc(db, "Actividades", selectedHabit.id);
        const actividadSnap = await getDoc(actividadRef);
        if (!actividadSnap.exists()) return;

        const actividadData = actividadSnap.data();
        const fechaHoy = date.getDate() + " " + date.getMonth();
        const mes = meses[date.getMonth()];

        // Actualizar fecha de la actividad
        await updateDoc(actividadRef, { fecha: fechaHoy });

        // Actualizar conteo mensual (solo valores numéricos)
        const valorAnterior = actividadData[mes] || 0;
        await updateDoc(actividadRef, { [mes]: selectedHabit.trackingType === "binary" ? 1 : valorAnterior + cantidad });

        // Actualizar tracking de último mes
        let datos_mes = Array.isArray(actividadData.ultimo_mes) ? [...actividadData.ultimo_mes] : Array(31).fill(0);

        const actFecha = actividadData.fecha?.split(" ") || [0, 0];
        let dif_dias = 0;
        if (date.getMonth() === parseInt(actFecha[1])) {
          dif_dias = Math.max(0, date.getDate() - parseInt(actFecha[0]) - 1);
        } else {
          dif_dias = diasMeses[parseInt(actFecha[1])] - parseInt(actFecha[0]) + date.getDate() - 1;
        }

        for (let i = 0; i < dif_dias; i++) {
          datos_mes.shift();
          datos_mes.push(0);
        }

        // Registrar el día actual
        datos_mes.shift();
        datos_mes.push(selectedHabit.trackingType === "binary" ? 1 : parseInt(cantidad));

        await updateDoc(actividadRef, { ultimo_mes: datos_mes });

        // Actualizar racha de usuario
        if (usuario.fecha !== fechaHoy) {
          const usuarioRef = doc(db, "Usuarios", usuario.id);
          await updateDoc(usuarioRef, {
            racha: (usuario.racha || 0) + 1,
            fecha: fechaHoy,
          });
        }

        closePopUp();
      } catch (error) {
        console.log("Error completando hábito:", error);
        Alert.alert("Error", "No se pudo registrar el hábito");
      }
    };




  const transformArreglo = (arreglo) => {
    try {

      if (!Array.isArray(arreglo)) return [];

      return arreglo.map((v) => ({ value: v }));
    } catch (e) {
      console.log("Error en transformArreglo:", e);
      return [];
    }
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
            const bg = item.color || '#4a90e2';
            const todayStr = new Date().getDate() + " " + new Date().getMonth();
            const reg = (todayStr == item.fecha) ? '#4df358ff' :item.isGroupActivity && item.status === "pending"  ? '#facc15' : '#ef4444';//amarillo para peniente
            const title = item.nombre || item.name || 'Actividad';
            const ultimoMes = transformArreglo(item.ultimo_mes || []);
            return (
              <TouchableOpacity
                style={[styles.activityBox, { backgroundColor: bg }]}
                onPress={() => openPopUp(item)}
              >
                <View style={styles.activityRow}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.icono}>{item.icon}</Text>
                    <Text style={styles.activityTitle} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
                  </View>
                  <View style={[styles.dispDisplay, {backgroundColor: reg}]}> 
                    <Text style={styles.disp}>{(dateAct == item.fecha) ? "Registrada" : "No Registrada"}</Text>
                  </View>
                </View>
                <View style={styles.graphPlaceholder}>
                  <LineChart
                    data={ultimoMes}
                    spacing={8}
                    initialSpacing={0}
                    width={250}
                    height={60}
                    hideAxesAndRules
                    hideDataPoints1
                    thickness1={5}
                    color1='rgba(48, 48, 48, 1)'
                  />
                </View>
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
    fontSize: 18,
    fontWeight: '600',
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: 160,
    marginBottom: 0,
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
    marginLeft: 8,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  activityHeader: {
    // legacy, not used
  },
  activityRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    minWidth: 0,
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
