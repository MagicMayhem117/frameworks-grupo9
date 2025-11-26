import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
 ScrollView,
} from "react-native";
import {
  getFirestore,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { LineChart, BarChart } from "react-native-gifted-charts";

export default function ActivityDetailScreen({ route, navigation }) {
  const { activity } = route.params;
  const [guardando, setGuardando] = useState(false);
  const [publico, setPublico] = useState(activity.publico);
  const [ultimoMes, setUltimoMes] = useState([]);
  const [meta, setMeta] = useState([]);
  const [mesTotal, setMesTotal] = useState([]);

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

  useEffect(() => {
    const fetchData = async () => {
      const arregloGrafica = activity.ultimo_mes || [];

      const transformedData = arregloGrafica.map((value) => ({
        value: value,
      }));

      setUltimoMes(transformedData);
    };

    fetchData();

    const metaArray = Array(33).fill(activity.goal ? activity.goal : 1);
    const transformedMeta = metaArray.map((value) => ({
      value: value,
    }));

    setMeta(transformedMeta);

    const mesesArray = []

    for (var i in meses) {
      const mes = meses[i]
      if (activity[mes]) {
        mesesArray.push({value: activity[mes], label: mes[0].toUpperCase()})
      }
    }

    setMesTotal(mesesArray);
  }, []);

  const handleSave = async () => {
    try {
      setGuardando(true);
      // Solo actualizamos 'publico'
      await updateDoc(doc(db, "Actividades", activity.id), { publico: publico });
      Alert.alert("Éxito", "Actividad actualizada correctamente");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo actualizar");
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Eliminar Actividad",
      "¿Seguro que deseas eliminar esta actividad?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "Actividades", activity.id));
              Alert.alert("Eliminado", "Actividad eliminada correctamente");
              navigation.goBack();
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "No se pudo eliminar la actividad");
            }
          },
        },
      ]
    );
  };

  const stepMes = (activity.goal * 30) / 10;
  console.log(activity.goal, stepMes);

  return (
  <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
    <View style={styles.container}>
      <Text style={styles.title}>Editar Actividad</Text>

      {/* nombre estilizado y no editable */}
      <View style={styles.nameCard}>
        <Text style={styles.label}>Nombre de la actividad</Text>
        <Text style={styles.activityName}>{activity.name}</Text>
      </View>

      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceText}>Actividad Pública</Text>
        <Switch value={publico} onValueChange={setPublico} />
      </View>

      {/* titulo para la grafica */}
      <Text style={styles.chartTitle}>Progreso reciente</Text>

      <View style={{ marginBottom: 20 }}>
        {activity.trackingType == "binary" ? (
          <LineChart
            data2={ultimoMes}
            data={meta}
            spacing={10}
            initialSpacing={0}
            width={300}
            height={150}
            hideDataPoints1
            hideDataPoints2
            color1={activity.color}
            thickness1={3}
            thickness2={5}
            color2='rgba(48, 48, 48, 1)'
            stepValue={1}
            noOfSections={1}
            showFractionalValues={false}
          />
          /*<BarChart
            data={ultimoMes}
            spacing={1}
            initialSpacing={0}
            barWidth={9}
            height={150}
            noOfSections={1}
          />*/
        ) : (
          <LineChart
            data2={ultimoMes}
            data={meta}
            spacing={10}
            initialSpacing={0}
            width={300}
            height={150}
            hideDataPoints1
            hideDataPoints2
            color1={activity.color}
            thickness1={3}
            thickness2={5}
            color2='rgba(48, 48, 48, 1)'
            showFractionalValues={false}
            stepValue={1}
          />
        )}
      </View>

      <Text style={styles.chartTitle}>Progreso por meses</Text>

      <View style={{ marginBottom: 20 }}>
        <BarChart
          data={mesTotal}
          spacing={5}
          initialSpacing={5}
          width={300}
          height={150}
          hideDataPoints1
          frontColor={activity.color}
          stepValue={stepMes}
          barWidth={20}
          showFractionalValues={false}
        />
        </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#4f46e5" }]}
        onPress={handleSave}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Guardar Cambios</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#ef4444" }]}
        onPress={handleDelete}
      >
        <Text style={styles.buttonText}>Eliminar Actividad</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },

  // Estilos para la tarjeta del nombre
  nameCard: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4f46e5",
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  activityName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },

  // Estilo para el título de la grafica
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#374151",
  },

  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20, //margen para separar de la grafica
  },
  preferenceText: {
    fontSize: 16,
  },
});