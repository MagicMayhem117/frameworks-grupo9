// --- IMPORTS ---
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
import auth from "@react-native-firebase/auth";
import firebaseConfig from "../keys.js";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from "../context/UserContext";
import { getUserByEmail } from "../db/userQueries";
import Icon from "react-native-vector-icons/Ionicons";

// ICONS & COLORS
const COLORS = {
  "Salud Física y Bienestar": "#3b82f6",
  "Salud Mental y Estrés": "#8b5cf6",
  "Productividad y Desarrollo Personal": "#10b981",
  "Organización y Tareas del Hogar": "#f59e0b",
  Finanzas: "#ef4444",
  "Relaciones Sociales": "#dd74a9",
};

const CATEGORY_ICONS = {
  "Salud Física y Bienestar": "💪",
  "Salud Mental y Estrés": "🧘",
  "Productividad y Desarrollo Personal": "🚀",
  "Organización y Tareas del Hogar": "🏠",
  "Finanzas": "💵",
  "Relaciones Sociales": "❤",
};

const DEFAULT_ICONS = {
  "Hacer ejercicio (general)": "🏋️",
  "Ir al gimnasio": "🏋️‍♂️",
  Caminar: "🚶",
  "Correr / Salir a trotar": "🏃",
  "Hacer yoga": "🧘",
  "Beber 2+ litros de agua": "💧",
  "Dormir 7-8 horas": "😴",
  "Acostarse antes de las 11 PM": "🌙",
  "Despertarse antes de las 7 AM": "⏰",
  "Tomar medicamentos / Vitaminas": "💊",
  "Usar hilo dental": "🦷",
  "Comida preparada en casa (Almuerzo)": "🍽️",
  "Comida preparada en casa (Cena)": "🍽️",
  "Comer 5 porciones de fruta/vegetales": "🍎",
  "Registrar peso": "⚖️",
  "Día sin comida chatarra": "🚫🍔",
  "Día sin azúcar añadido": "🚫🍬",
  "Día sin alcohol": "🚫🍺",
  "Día sin fumar": "🚭",
  Meditar: "🧘",
  "Escribir en el diario (Journaling)": "📓",
  "No usar el móvil 1h antes de dormir": "📵",
  "Tiempo de relajación (sin culpa)": "🛀",
  "Pasar tiempo al aire libre / Naturaleza": "🌳",
  "Tomar el sol": "☀️",
  "Escribir sobre un pensamiento negativo": "✏️",
  Leer: "📚",
  "Estudiar un idioma": "🗣️",
  "Practicar instrumento/habilidad": "🎸",
  "Estudiar para un curso": "📖",
  "Ver/escuchar contenido educativo (Podcast, video)": "🎧",
  "Planificar el día (Definir prioridades)": "🗓️",
  "Trabajar en proyecto personal / negocio secundario": "💻",
  "Enviar currículums / Buscar trabajo": "📄",
  "Hacer 'networking'": "🤝",
  "Tiempo en redes sociales menor a 1 hora": "📱",
  "Llegar a tiempo": "⏱️",
  "Escuchar un álbum de música nuevo": "🎵",
  "Probar una nueva receta": "🍳",
  "Limpiar / Ordenar": "🧹",
  "Tender la cama": "🛏️",
  "Lavar la ropa": "🧺",
  "Hacer la compra / Supermercado": "🛒",
  "Sacar la basura": "🗑️",
  "Regar las plantas": "🌱",
  "Preparar la ropa para el día siguiente": "👕",
  "Pasear al perro": "🐕",
  "Jugar con la mascota": "🐾",
  "Limpiar la caja de arena / jaula": "🐈",
  "Ayudar a los hijos con la tarea": "👨‍👩‍👧‍👦",
  "Leer un cuento a los hijos": "📘",
  "Jugar con los hijos": "🧸",
  "Registrar gastos del día": "💰",
  "Transferir dinero a cuenta de ahorros": "🏦",
  "Realizar un pago a deuda": "💳",
  "Día sin gastos (innecesarios)": "🚫💸",
  "Revisar estado de cuenta / presupuesto": "📊",
  "Llamar a un familiar / amigo": "📞",
  "Tiempo de calidad (Familia)": "👨‍👩‍👧",
  "Tiempo de calidad (Pareja)": "❤️",
  "Tiempo de calidad (Amigos)": "🧑‍🤝‍🧑",
};

const CATEGORIES = {
  "Salud Física y Bienestar": [
    "Hacer ejercicio (general)",
    "Ir al gimnasio",
    "Caminar",
    "Correr / Salir a trotar",
    "Hacer yoga",
    "Beber 2+ litros de agua",
    "Dormir 7-8 horas",
    "Acostarse antes de las 11 PM",
    "Despertarse antes de las 7 AM",
    "Tomar medicamentos / Vitaminas",
    "Usar hilo dental",
    "Comida preparada en casa (Almuerzo)",
    "Comida preparada en casa (Cena)",
    "Comer 5 porciones de fruta/vegetales",
    "Registrar peso",
    "Día sin comida chatarra",
    "Día sin azúcar añadido",
    "Día sin alcohol",
    "Día sin fumar",
  ],
  "Salud Mental y Estrés": [
    "Meditar",
    "Escribir en el diario (Journaling)",
    "No usar el móvil 1h antes de dormir",
    "Tiempo de relajación (sin culpa)",
    "Pasar tiempo al aire libre / Naturaleza",
    "Tomar el sol",
    "Escribir sobre un pensamiento negativo",
  ],
  "Productividad y Desarrollo Personal": [
    "Leer",
    "Estudiar un idioma",
    "Practicar instrumento/habilidad",
    "Estudiar para un curso",
    "Ver/escuchar contenido educativo (Podcast, video)",
    "Planificar el día (Definir prioridades)",
    "Trabajar en proyecto personal / negocio secundario",
    "Enviar currículums / Buscar trabajo",
    "Hacer 'networking'",
    "Tiempo en redes sociales menor a 1 hora",
    "Llegar a tiempo",
    "Escuchar un álbum de música nuevo (atentamente)",
    "Probar una nueva receta",
  ],
  "Organización y Tareas del Hogar": [
    "Limpiar / Ordenar",
    "Tender la cama",
    "Lavar la ropa",
    "Hacer la compra / Supermercado",
    "Sacar la basura",
    "Regar las plantas",
    "Preparar la ropa para el día siguiente",
    "Pasear al perro",
    "Jugar con la mascota",
    "Limpiar la caja de arena / jaula",
    "Ayudar a los hijos con la tarea",
    "Leer un cuento a los hijos",
    "Jugar con los hijos",
  ],
  Finanzas: [
    "Registrar gastos del día",
    "Transferir dinero a cuenta de ahorros",
    "Realizar un pago a deuda",
    "Día sin gastos (innecesarios)",
    "Revisar estado de cuenta / presupuesto",
  ],
  "Relaciones Sociales": [
    "Llamar a un familiar / amigo",
    "Tiempo de calidad (Familia)",
    "Tiempo de calidad (Pareja)",
    "Tiempo de calidad (Amigos)",
  ],
};

const DAYS_OF_WEEK = [
  { key: "Sun", label: "D" },
  { key: "Mon", label: "L" },
  { key: "Tue", label: "M" },
  { key: "Wed", label: "X" },
  { key: "Thu", label: "J" },
  { key: "Fri", label: "V" },
  { key: "Sat", label: "S" },
];

// ---------- MODAL DE ICONO Y COLOR ----------
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
            {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#6b7280"].map((c) => (
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
            {["💧", "🏃", "📖", "🍎", "💵", "🧠", "🧘‍♀️", "😴", "✏️", "💻"].map((i) => (
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

// ---------- MODAL DE FRECUENCIA ----------
const FrequencyModal = ({ visible, onClose, onSelect, currentDays }) => {
  const [days, setDays] = useState(currentDays);

  const toggleDay = (key) => {
    setDays((prev) => (prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]));
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
      : `${days.map((d) => DAYS_OF_WEEK.find((w) => w.key === d)?.label).join(", ")} (${days.length}/semana)`;

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

// ---------- PANTALLA PRINCIPAL ----------
export default function CreateHabitScreen({ navigation }) {
  const [habitName, setHabitName] = useState("");
  const [isQuantitative, setIsQuantitative] = useState(true);
  const [dailyGoal, setDailyGoal] = useState("1");
  const [unit, setUnit] = useState("veces");
  const [iconColor, setIconColor] = useState({ icon: "✨", color: "#4f46e5" });
  const [selectedDays, setSelectedDays] = useState(DAYS_OF_WEEK.map((d) => d.key));
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showFreqModal, setShowFreqModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { email } = useUser();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    if (!email) return;
    (async () => {
      const data = await getUserByEmail(email);
      setUsuario(data);
    })();
  }, [email]);

  useEffect(() => {
    return auth().onAuthStateChanged((u) => {
      setUserId(u?.uid || null);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (saving) return;
    if (!habitName.trim()) {
      setMessage("Debes seleccionar un hábito.");
      return;
    }
    if (!usuario || !usuario.id) {
      setMessage("No se pudo obtener la información del usuario.");
      return;
    }
    if (!userId) {
      setMessage("Usuario no autenticado.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const usuarioDocId = usuario && usuario.id ? usuario.id : userId;
      const usuarioRef = doc(db, "Usuarios", usuarioDocId);

      await setDoc(
        usuarioRef,
        {
          uid: userId,
          email: auth().currentUser?.email || null,
          nombre: usuario?.nombre || auth().currentUser?.displayName || "Sin nombre",
          actividades: usuario?.actividades || [],
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const actRef = await addDoc(collection(db, "Actividades"), {
        name: habitName.trim(),
        usuario_id: userId,
        trackingType: isQuantitative ? "quantitative" : "binary",
        goal: isQuantitative ? parseFloat(dailyGoal) || 1 : 1,
        unit: isQuantitative ? unit.trim() : "completado",
        icon: iconColor.icon,
        color: iconColor.color,
        frequencyDays: selectedDays,
        createdAt: serverTimestamp(),
      });

      await updateDoc(usuarioRef, {
        actividades: arrayUnion(actRef.id),
        updatedAt: serverTimestamp(),
      });

      setMessage("¡Hábito creado con éxito!");
      setHabitName("");
      navigation.navigate("Stats");
    } catch (err) {
      console.error("Error guardando hábito:", err);
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
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Nuevo Hábito</Text>
          {message !== "" && <Text style={styles.message}>{message}</Text>}

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
            <Text>
              {selectedDays.length === 7 ? "Todos los días" : `${selectedDays.length}/semana`}
            </Text>
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
      </SafeAreaView>

      <HabitSelectorModal
        visible={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        onSelect={(h) => {
          setHabitName(h.name);
          setIconColor({ icon: h.icon, color: h.color });
          setShowHabitModal(false);
        }}
      />

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
    </>
  );
}

// ---------- ESTILOS ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#4f46e5" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 20, color: "#111827" },
  label: { fontSize: 16, fontWeight: "500", marginTop: 10, color: "#374151" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, marginTop: 4 },
  iconButton: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginTop: 6 },
  icon: { fontSize: 28, color: "#fff" },
  toggleRow: { flexDirection: "row", marginTop: 10 },
  toggleButton: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#4f46e5", alignItems: "center", borderRadius: 8, marginHorizontal: 4 },
  activeButton: { backgroundColor: "#4f46e5" },
  activeText: { color: "#fff", fontWeight: "600" },
  inactiveText: { color: "#4f46e5", fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  saveButton: { marginTop: 20, backgroundColor: "#4f46e5", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  saveText: { color: "white", fontWeight: "700", fontSize: 16 },
  message: { backgroundColor: "#e0e7ff", color: "#4338ca", padding: 8, borderRadius: 8, textAlign: "center", marginBottom: 10 },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "100%" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#111827" },

  previewContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  previewCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center" },
  previewIcon: { fontSize: 28, color: "white" },
  previewLabel: { marginLeft: 10, fontSize: 16 },

  subTitle: { marginTop: 10, fontWeight: "600", color: "#6b7280" },
  colorsGrid: { flexDirection: "row", flexWrap: "wrap", marginVertical: 10 },
  colorOption: { width: 30, height: 30, borderWidth: 2, borderRadius: 15, margin: 4 },
  iconsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  iconOption: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 6, margin: 4 },
  iconText: { fontSize: 22 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
  cancelButton: { backgroundColor: "#e5e7eb" },
  confirmButton: { backgroundColor: "#4f46e5" },
  cancelText: { color: "#111827", fontWeight: "600" },
  confirmText: { color: "white", fontWeight: "600" },

  daysRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  dayButton: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  dayText: { fontWeight: "700" },
  summaryText: { textAlign: "center", color: "#374151", marginVertical: 10 },
});
