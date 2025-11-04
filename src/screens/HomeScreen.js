import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useUser } from "../context/UserContext";
import HabitPopUp from '../components/HabitPopUp';
import { getUserByEmail, getActividades } from "../db/userQueries";

const HomeScreen = () => {
  const { email } = useUser();
  const [usuario, setUsuario] = useState(null);
  const [act, setAct] = useState([]);
  const [popUpVisible, setPopUpVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      if (email) {
        const userData = await getUserByEmail(email);
        setUsuario(userData);
        {/* Consigue el usuario, crea un array con las actividades con otra consulta */}
        const actividadIds = userData?.actividades || [];
        if (actividadIds.length > 0) {
          console.log(actividadIds);
          const actDataArray = await getActividades(actividadIds);
          console.log('Activities loaded', actDataArray);
          setAct(actDataArray);
        } else {
          setAct([]);
        }
      }
    }
    fetchUser();
  }, [email]);


  const openPopUp = (habit) => {
    setSelectedHabit(habit);
    setPopUpVisible(true);
  };

  const closePopUp = () => {
    setSelectedHabit(null);
    setPopUpVisible(false);
  };

  const completeHabit = () => {
    // Aquí va la lógica para marcar el hábito como completado
    console.log('Hábito completado con ID:', selectedHabit.id);
    closePopUp();
  };

  return (
    <View style={styles.container}>
      {/*<Text style={styles.title}>¡Bienvenido a DailyTrack!</Text>
      <Text>{usuario ? usuario.nombre : 'Cargando usuario...'}</Text>
      <Button title="Cerrar Sesión" onPress={() => auth().signOut()} />*/}

      {act.length === 0 ? (
        <Text style={{ marginTop: 12 }}>Cargando actividad...</Text>
      ) : (
        <FlatList
          data={act}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16, width: '100%', alignItems: 'left' }}
          renderItem={({ item }) => {
            const bg = item.color || '#4a90e2';
            const title = item.nombre || item.name || 'Actividad';
            return (
              <TouchableOpacity
                style={[styles.activityBox, { backgroundColor: bg }]}
                onPress={() => openPopUp(item)}
              >
                <View style={styles.activityHeader}>
                  <Text style={styles.icono}>{item.icon}</Text>
                  <Text style={styles.activityTitle}>{title}</Text>
                </View>
                {/* Lugar para poner una gráfica */}
                <View style={styles.graphPlaceholder} />
              </TouchableOpacity>
            );
          }}
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
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'left', padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
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
  activityTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  graphPlaceholder: {
    width: '100%',
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
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

export default HomeScreen;