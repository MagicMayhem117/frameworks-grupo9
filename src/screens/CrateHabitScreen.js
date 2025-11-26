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
import { db } from "../firebase";
import { doc, setDoc, collection, addDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useUser } from "../context/UserContext";
import { getUserByEmail, getAmigos } from "../db/userQueries";
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

// ----------------------------------------------------------------------
// MODAL DE SELECCIÓN DE HÁBITO
// ----------------------------------------------------------------------
function HabitSelectorModal({ visible, onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const [openCats, setOpenCats] = useState(new Set());

  const filteredResults = {};
  Object.keys(CATEGORIES).forEach((cat) => {
    filteredResults[cat] = CATEGORIES[cat].filter((h) =>
      h.toLowerCase().includes(search.toLowerCase())
    );
  });

  useEffect(() => {
    if (search.trim() === "") {
      setOpenCats(new Set());
    } else {
      const catsWithResults = Object.keys(filteredResults).filter(
        (cat) => filteredResults[cat].length > 0
      );
      setOpenCats(new Set(catsWithResults));
    }
  }, [search]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.modalFull}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Icon name="arrow-back" size={30} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Seleccionar Hábito</Text>
          <View style={{ width: 40 }} />
        </View>

        <TextInput
          placeholder="Buscar hábito predefinido..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoFocus={false}
          clearButtonMode="while-editing"
        />

        <ScrollView style={{ flex: 1 }}>
          {Object.keys(filteredResults).map((cat) => {
            const habits = filteredResults[cat];
            if (habits.length === 0) return null;

            const isOpen = openCats.has(cat);

            return (
              <View key={cat} style={styles.categoryBlock}>
                <TouchableOpacity
                  style={[styles.categoryHeader, { backgroundColor: COLORS[cat] }]}
                  onPress={() => {
                    setOpenCats((prev) => {
                      const newSet = new Set(prev);
                      if (newSet.has(cat)) newSet.delete(cat);
                      else newSet.add(cat);
                      return newSet;
                    });
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 26, marginRight: 12 }}>{CATEGORY_ICONS[cat]}</Text>
                    <Text style={styles.categoryTitle}>{cat}</Text>
                  </View>
                  <Icon
                    name={isOpen ? "chevron-down" : "chevron-forward"}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>

                {isOpen &&
                  habits.map((habit) => (
                    <TouchableOpacity
                      key={habit}
                      style={styles.habitOption}
                      onPress={() => {
                        onSelect({
                          name: habit,
                          icon: DEFAULT_ICONS[habit] || "✨",
                          color: COLORS[cat],
                        });
                        onClose();
                      }}
                    >
                      <Text style={styles.habitText}>
                        {DEFAULT_ICONS[habit] || "✨"} {habit}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            );
          })}

          {search.trim() !== "" &&
            Object.values(filteredResults).every((arr) => arr.length === 0) && (
              <Text style={styles.noResultsText}>
                No se encontraron hábitos para "{search}"
              </Text>
            )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ------------------ MODAL DE ICONO Y COLOR (TU ORIGINAL) ------------------
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

// ------------------ MODAL DE FRECUENCIA (TU ORIGINAL) ------------------
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

// ----------------------------------------------------------------------
// PANTALLA PRINCIPAL
// ----------------------------------------------------------------------
export default function CreateHabitScreen({ navigation }) {
  const [habitName, setHabitName] = useState("");
  const [isGroupActivity, setIsGroupActivity] = useState(false);
  const [isQuantitative, setIsQuantitative] = useState(true);
  const [dailyGoal, setDailyGoal] = useState("1");
  const [unit, setUnit] = useState("veces");
  const [iconColor, setIconColor] = useState({ icon: "✨", color: "#4f46e5" });
  const [selectedDays, setSelectedDays] = useState(DAYS_OF_WEEK.map((d) => d.key));
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showFreqModal, setShowFreqModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [amigosSeleccionados, setAmigosSeleccionados] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { email } = useUser();
  const [usuario, setUsuario] = useState(null);
  const toggleFriendSelection = (id) => {//mantiene actualizada la checklist de amigos
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };


  useEffect(() => {
    if (!email) return;
    (async () => {
      const data = await getUserByEmail(email);
      setUsuario(data);
    })();
  }, [email]);
    //amigos desde firebase
  useEffect(() => {
    if (!usuario) return;

    let isActive = true;
    const fetchFriends = async () => {
      try {
        const amigosIds = usuario.amigos || [];
        if (amigosIds.length > 0) {
          const amData = await getAmigos(amigosIds);
          if (isActive) setFriends(amData);
        } else {
          if (isActive) setFriends([]);
        }
      } catch (err) {
        console.error(err);
        if (isActive) setFriends([]);
      }
    };

    fetchFriends();
    return () => { isActive = false; };
  }, [usuario]);

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
      if (isQuantitative && (Number(dailyGoal) <= 0 || isNaN(Number(dailyGoal)))) {
        setMessage("La meta diaria debe ser un número mayor a 0.");
        return;
      }

      setSaving(true);
      setMessage("");

      try {
        // 1) Crear documento de actividad en la colección "Actividades"
        const actRef = await addDoc(collection(db, "Actividades"), {
          name: habitName,
          usuario_id: usuario.id,
          trackingType: isQuantitative ? "quantitative" : "binary",
          goal: isQuantitative ? Number(dailyGoal) : 1,
          unit: isQuantitative ? unit.trim() : "completado",
          isGroupActivity: isGroupActivity,
          icon: iconColor.icon,
          color: iconColor.color,
          friends: amigosSeleccionados || [],
          // status: si es grupal lo ponemos activo directamente
          status: isGroupActivity ? "active" : "active",
          createdAt: new Date(),
          // campos opcionales útiles para lógica posterior
          participantes: isGroupActivity ? [usuario.id, ...(amigosSeleccionados || [])] : [usuario.id],
          selectedDays: selectedDays || DAYS_OF_WEEK.map(d => d.key),
        });

        // 2) Asegurarnos de que el documento contenga su propio id (opcional, pero útil)
        try {
          await updateDoc(actRef, { id: actRef.id });
        } catch (err) {
          // no crítico; continuar si falla
          console.warn("No se pudo escribir id en la actividad:", err);
        }

        // 3) Añadir el id de la actividad al array 'actividades' del creador
        await updateDoc(doc(db, "Usuarios", usuario.id), {
          actividades: arrayUnion(actRef.id),
        });

        // 4) Si es actividad grupal, agregar la actividad directamente a cada amigo seleccionado
        if (isGroupActivity && Array.isArray(amigosSeleccionados) && amigosSeleccionados.length > 0) {
          // Hacemos las actualizaciones en paralelo (pero con control de errores)
          const updates = amigosSeleccionados.map(async (friendId) => {
            try {
              await updateDoc(doc(db, "Usuarios", friendId), {
                actividades: arrayUnion(actRef.id),
              });
            } catch (err) {
              console.warn(`No se pudo añadir actividad al usuario ${friendId}:`, err);
              // No hacemos throw para no rompertodo si falla un amigo
            }
          });

          await Promise.all(updates);
        }

        // 5) Fin - feedback y reset UI
        setMessage("¡Hábito creado y agregado al Home de los participantes!");
        setHabitName("");
        setDailyGoal("1");
        setUnit("veces");
        setIconColor({ icon: "✨", color: "#4f46e5" });
        setSelectedDays(DAYS_OF_WEEK.map((d) => d.key));
        setAmigosSeleccionados([]);
        navigation.navigate("Stats");
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
        {message !== "" && <Text style={styles.message}>{message}</Text>}

        <Text style={styles.label}>Hábito</Text>
        <TouchableOpacity
          style={[styles.input, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}
          onPress={() => setShowHabitModal(true)}
        >
          <Text style={{ color: habitName ? "#000" : "#999" }}>
            {habitName || "Seleccionar hábito..."}
          </Text>
          {habitName !== "" && <Text style={{ fontSize: 24 }}>{iconColor.icon}</Text>}
        </TouchableOpacity>

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

        {/*actividades compartidas*/}
        <Text style={styles.label}>Actividad Conjunta</Text>
        <TouchableOpacity
          style={[styles.toggleButton, isGroupActivity && styles.activeButton]}
          onPress={() => setIsGroupActivity(!isGroupActivity)}
        >
          <Text style={isGroupActivity ? styles.activeText : styles.inactiveText}>
            {isGroupActivity ? "Sí" : "No"}
          </Text>
        </TouchableOpacity>

        {/*checklist de amigos solo si el toggle anterior es true*/}
        {isGroupActivity && friends.length > 0 && (
          <View style={{ marginTop: 15 }}>
            <Text style={{ fontWeight: '600', marginBottom: 5 }}>Selecciona amigos:</Text>
            {friends.map(friend => (
              <TouchableOpacity
                key={friend.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 5
                }}
                onPress={() => {
                  if (amigosSeleccionados.includes(friend.id)) {
                    setAmigosSeleccionados(prev => prev.filter(id => id !== friend.id));
                  } else {
                    setAmigosSeleccionados(prev => [...prev, friend.id]);
                  }
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: '#555',
                  marginRight: 10,
                  backgroundColor: amigosSeleccionados.includes(friend.id) ? '#5A4DF3' : '#FFF'
                }} />
                <Text>{friend.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}


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

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
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
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------------
// ESTILOS COMPLETOS (con los estilos de tus modales originales añadidos)
// ----------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#4f46e5" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20, color: "#111827" },
  label: { fontSize: 16, fontWeight: "600", marginTop: 16, marginBottom: 6, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
  },
  message: {
    backgroundColor: "#dbeafe",
    color: "#4338ca",
    padding: 12,
    borderRadius: 12,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },

  modalFull: { flex: 1, backgroundColor: "#f9fafb" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  searchInput: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    fontSize: 16,
  },
  categoryBlock: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
  habitOption: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  habitText: {
    fontSize: 16,
    color: "#111827",
  },
  noResultsText: {
    textAlign: "center",
    paddingVertical: 50,
    color: "#6b7280",
    fontSize: 16,
    fontStyle: "italic",
  },

  iconButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  icon: { fontSize: 32 },

  toggleRow: { flexDirection: "row", marginTop: 8 },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#4f46e5",
    alignItems: "center",
    borderRadius: 12,
    marginHorizontal: 6,
  },
  activeButton: { backgroundColor: "#4f46e5" },
  activeText: { color: "#fff", fontWeight: "600" },
  inactiveText: { color: "#4f46e5", fontWeight: "600" },

  row: { flexDirection: "row", marginTop: 8 },

  saveButton: {
    marginTop: 30,
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 4,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 17 },

  // ESTILOS DE TUS MODALES ORIGINALES
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