import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import firebaseConfig from "../keys.js";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import { getUserByEmail } from "../db/userQueries";

const ICONS = ["💧", "🏃", "📚", "🍎", "💰", "🧠", "🧘", "😴", "✏", "💻"];
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#6b7280",
];
const DAYS_OF_WEEK = [
  { key: "Sun", label: "D" },
  { key: "Mon", label: "L" },
  { key: "Tue", label: "M" },
  { key: "Wed", label: "X" },
  { key: "Thu", label: "J" },
  { key: "Fri", label: "V" },
  { key: "Sat", label: "S" },
];

// ------------------ MODAL DE ICONO Y COLOR ------------------
const IconColorModal = ({ visible, onClose, onSelect, current }) => {
  const [icon, setIcon] = useState(current.icon);
  const [color, setColor] = useState(current.color);

  const handleConfirm = () => {
    onSelect({ icon, color });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Icono y Color</Text>

          <View style={styles.previewContainer}>
            <View style={[styles.previewCircle, { backgroundColor: color }]}>
              <Text style={styles.previewIcon}>{icon}</Text>
            </View>
            <Text style={styles.previewLabel}>Vista previa</Text>
          </View>

          <Text style={styles.subTitle}>Color de Acento</Text>
          <View style={styles.colorsGrid}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorOption,
                  { backgroundColor: c, borderColor: c === color ? "black" : "#ccc" },
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>

          <Text style={styles.subTitle}>Icono del Hábito</Text>
          <View style={styles.iconsGrid}>
            {ICONS.map((i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.iconOption,
                  i === icon && { backgroundColor: "#e0e7ff", borderColor: "#4f46e5" },
                ]}
                onPress={() => setIcon(i)}
              >
                <Text style={styles.iconText}>{i}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={[styles.button, styles.confirmButton]}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ------------------ MODAL DE FRECUENCIA ------------------
const FrequencyModal = ({ visible, onClose, onSelect, currentDays }) => {
  const [days, setDays] = useState(currentDays);

  const toggleDay = (key) => {
    setDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const handleConfirm = () => {
    onSelect(days);
    onClose();
  };

  const summary =
    days.length === 7
      ? "Todos los días (7/semana)"
      : days.length === 0
      ? "Ningún día seleccionado"
      : `${days.map((d) => DAYS_OF_WEEK.find((w) => w.key === d)?.label).join(", ")} (${
          days.length
        }/semana)`;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Frecuencia Semanal</Text>
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  days.includes(day.key)
                    ? { backgroundColor: "#4f46e5" }
                    : { backgroundColor: "#e5e7eb" },
                ]}
                onPress={() => toggleDay(day.key)}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: days.includes(day.key) ? "white" : "#111827" },
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.summaryText}>{summary}</Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={[styles.button, styles.confirmButton]}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ------------------ PANTALLA PRINCIPAL ------------------
export default function CreateHabitScreen() {
  const [habitName, setHabitName] = useState("");
  const [isQuantitative, setIsQuantitative] = useState(true);
  const [dailyGoal, setDailyGoal] = useState("1");
  const [unit, setUnit] = useState("veces");
  const [iconColor, setIconColor] = useState({ icon: "💧", color: "#3b82f6" });
  const [selectedDays, setSelectedDays] = useState(DAYS_OF_WEEK.map((d) => d.key));
  const [showIconModal, setShowIconModal] = useState(false);
  const [showFreqModal, setShowFreqModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const app = initializeApp(firebaseConfig);

  const db = getFirestore(app);

  const { email } = useUser();
  const [usuario, setUsuario] = useState(null);
  
  useEffect(() => {
    async function fetchUser() {
      if (email) {
        const userData = await getUserByEmail(email);
        setUsuario(userData);
      }
    }
    fetchUser();
  }, [email]);
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleCreate = async () => {
    if (!habitName.trim()) {
      setMessage("Debes ingresar un nombre para el hábito.");
      return;
    }
    if (!userId) {
      setMessage("Usuario no autenticado.");
      return;
    }
    setSaving(true);
    setMessage("");

    try {
      const actDoc = await addDoc(collection(db, "Actividades"), {
          name: habitName.trim(),
          usuario_id: usuario.id,
          trackingType: isQuantitative ? "quantitative" : "binary",
          goal: isQuantitative ? parseFloat(dailyGoal) || 1 : 1,
          unit: isQuantitative ? unit.trim() : "completado",
          icon: iconColor.icon,
          color: iconColor.color,
          frequencyDays: selectedDays,
          //createdAt: firestore.FieldValue.serverTimestamp(),
        });
      const usuarioRef = doc(db, "Usuarios", usuario.id);
      await updateDoc(usuarioRef, {
        actividades: arrayUnion(actDoc.id)
      });
      setMessage("¡Hábito creado con éxito!");
      setHabitName("");
    } catch (err) {
      setMessage(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando usuario...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Nuevo Hábito</Text>

        {message !== "" && <Text style={styles.message}>{message}</Text>}
        <Text>{usuario ? usuario.nombre : 'Cargando usuario...'}</Text>
        <Text style={styles.label}>Nombre del Hábito</Text>
        <TextInput
          style={styles.input}
          value={habitName}
          onChangeText={setHabitName}
          placeholder="Ej: Meditar, Beber agua..."
        />

        <Text style={styles.label}>Icono y Color</Text>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: iconColor.color }]}
          onPress={() => setShowIconModal(true)}
        >
          <Text style={styles.icon}>{iconColor.icon}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Tipo de Seguimiento</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, isQuantitative && styles.activeButton]}
            onPress={() => setIsQuantitative(true)}
          >
            <Text style={isQuantitative ? styles.activeText : styles.inactiveText}>
              Cuantitativo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isQuantitative && styles.activeButton]}
            onPress={() => setIsQuantitative(false)}
          >
            <Text style={!isQuantitative ? styles.activeText : styles.inactiveText}>
              Binario (Sí/No)
            </Text>
          </TouchableOpacity>
        </View>

        {isQuantitative && (
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Meta Diaria</Text>
              <TextInput
                style={styles.input}
                value={dailyGoal}
                onChangeText={setDailyGoal}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Unidad</Text>
              <TextInput style={styles.input} value={unit} onChangeText={setUnit} />
            </View>
          </View>
        )}

        <Text style={styles.label}>Frecuencia</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowFreqModal(true)}>
          <Text>{selectedDays.length === 7 ? "Todos los días" : `${selectedDays.length}/semana`}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, saving && { backgroundColor: "#a5b4fc" }]}
          onPress={handleCreate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Crear Hábito</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <IconColorModal
        visible={showIconModal}
        onClose={() => setShowIconModal(false)}
        onSelect={setIconColor}
        current={iconColor}
      />
      <FrequencyModal
        visible={showFreqModal}
        onClose={() => setShowFreqModal(false)}
        onSelect={setSelectedDays}
        currentDays={selectedDays}
      />
    </SafeAreaView>
  );
}

// ------------------ ESTILOS ------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#4f46e5" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#111827" },
  label: { fontSize: 16, fontWeight: "500", marginTop: 10, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  icon: { fontSize: 28, color: "#fff" },
  toggleRow: { flexDirection: "row", marginTop: 10 },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#4f46e5",
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeButton: { backgroundColor: "#4f46e5" },
  activeText: { color: "white", fontWeight: "600" },
  inactiveText: { color: "#4f46e5", fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "white", fontWeight: "700", fontSize: 16 },
  message: {
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    padding: 8,
    borderRadius: 8,
    textAlign: "center",
    marginBottom: 10,
  },

  // ----- Modal -----
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#111827" },
  previewContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  previewCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  previewIcon: { fontSize: 28, color: "white" },
  previewLabel: { marginLeft: 10, fontSize: 16 },
  subTitle: { marginTop: 10, fontWeight: "600", color: "#6b7280" },
  colorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderRadius: 15,
    margin: 4,
  },
  iconsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  iconOption: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 6,
    margin: 4,
  },
  iconText: { fontSize: 22 },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
  cancelButton: { backgroundColor: "#e5e7eb" },
  confirmButton: { backgroundColor: "#4f46e5" },
  cancelText: { color: "#111827", fontWeight: "600" },
  confirmText: { color: "white", fontWeight: "600" },
  daysRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: { fontWeight: "700" },
  summaryText: { textAlign: "center", color: "#374151", marginVertical: 10 },
});