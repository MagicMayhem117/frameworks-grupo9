import { React, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Switch,
} from "react-native";
import {
  getFirestore,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function ActivityDetailScreen({ route, navigation }) {
  const { activity } = route.params;
  const [nombre, setNombre] = useState(activity.name);
  const [guardando, setGuardando] = useState(false);
  const [publico, setPublico] = useState(activity.publico);

  const handleSave = async () => {
    try {
      setGuardando(true);
      console.log(activity.id);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Actividad</Text>

      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Nombre del hábito"
      />

      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceText}>Actividad Pública</Text>
        <Switch
        value={publico}
        onValueChange={setPublico}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  preferenceText: {
    fontSize: 16,
  },
});