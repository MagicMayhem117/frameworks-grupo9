import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  SafeAreaView,
  Modal, // importante para el popup
  Dimensions
} from "react-native";
//  Importamos la grafica de barras
import { BarChart } from "react-native-gifted-charts"; 

import { getActividadesPublicas, getSolicitudesActividades } from "../db/userQueries";
import { findProfile } from "../components/FindProfileImg";

const { width } = Dimensions.get("window");

export default function FriendProfileScreen({ route, navigation }) {
  const { profile } = route.params;
  const [act, setAct] = useState([]);

  // estados para el Modal y la Grafica
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [solicitudesActividades, setSolicitudesActividades] = useState([]);

  useEffect(() => {
    async function fetchUser() {
      const actividadIds = profile?.actividades || [];
      if (actividadIds.length > 0) {
        try {
          const actDataArray = await getActividadesPublicas(actividadIds);
          setAct(actDataArray);
        } catch (err) {
          console.error('Failed to load friend activities', err);
          setAct([]);
        }
      } else {
        setAct([]);
      }
      //solicitudes de actividades
      const solicitudes = profile?.solicitudes || [];

      if (solicitudes.length > 0) {
        try {
          const solicitudesData = await Promise.all(
            solicitudes.map(async (solicitud) => {
              // Traer datos de la actividad
              const actividadDoc = await getActividades(solicitud.habitId);
              return {
                ...solicitud,
                ...actividadDoc[0], // getActividades devuelve un arreglo
              };
            })
          );
          setSolicitudesActividades(solicitudesData);
        } catch (err) {
          console.error('Failed to load activity requests', err);
          setSolicitudesActividades([]);
        }
      } else {
        setSolicitudesActividades([]);
      }
    }
    fetchUser();
  }, [profile]);

  //lgica al presionar una actividad
  const handleActivityPress = (activity) => {
    // 1. Obtener datos del amigo
    const friendValue = activity.value || Math.floor(Math.random() * 100) + 20;

    // 2. Obtener/datos propio
    const myValue = Math.floor(Math.random() * 100) + 20; 

    // 3. Preparar datos para la grafica
    const data = [
      {
        value: myValue,
        label: 'Yo',
        frontColor: '#177AD5', // Azul para mi
        topLabelComponent: () => <Text style={{color: '#177AD5', fontSize: 12, marginBottom: 4}}>{myValue}</Text>,
      },
      {
        value: friendValue,
        label: profile?.nombre?.split(" ")[0] || 'Amigo', // Primer nombre
        frontColor: '#FF7F50', // Naranja para el amigo
        topLabelComponent: () => <Text style={{color: '#FF7F50', fontSize: 12, marginBottom: 4}}>{friendValue}</Text>,
      },
    ];

    setChartData(data);
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const handleDeleteFriend = () => {
    Alert.alert(
      "Eliminar amigo",
      `¿Deseas eliminar a ${profile?.nombre || 'este usuario'}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: () => {
            console.log("Eliminando..."); 
            navigation.goBack();
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* header curvo*/}
        <View style={styles.headerContainer}>
          <View style={styles.headerBackground}>
            <Text style={styles.watermarkText}>DailyTrack</Text>
          </View>
          
          <View style={styles.profileInfoContainer}>
            <View style={styles.avatarWrapper}>
              <Image 
                source={profile ? findProfile(profile.img_path) : require('../assets/profiles/perfil1.webp')} 
                style={styles.avatarImage} 
              />
            </View>
            
            <Text style={styles.usernameText}>
              {profile ? profile.nombre : 'Usuario'}
            </Text>
            <Text style={styles.emailText}>
              {profile ? profile.correo : 'cargando...'}
            </Text>
          </View>
        </View>

        {/* lista de actividades*/}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>Sus actividades</Text>

          {act.length === 0 ? (
            <Text style={styles.emptyText}>No hay actividades públicas para mostrar.</Text>
          ) : (
            act.map((item, index) => {
              const accentColor = item.color || '#4a90e2'; 
              const title = item.nombre || item.name || 'Actividad';
              const subtitle = item.meta || "Ver comparación"; 

              return (
                // cambiado de View a TouchableOpacity para detectar el clic
                <TouchableOpacity 
                  key={item.id || index} 
                  style={styles.cardContainer}
                  onPress={() => handleActivityPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.colorStrip, { backgroundColor: accentColor }]} />
                  
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardIcon}>{item.icon || '📊'}</Text>
                      <View style={styles.textColumn}>
                        <Text style={styles.cardTitle}>{title}</Text>
                        <Text style={styles.cardSubtitle}>{subtitle}</Text>
                      </View>
                      {/*icono pequeño indicando que se puede tocar */}
                      <Text style={{fontSize: 18, color: '#ccc'}}>›</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteFriend}>
            <Text style={styles.deleteButtonText}>Eliminar amigo</Text>
          </TouchableOpacity>
        </View>
        {/*solicitudes de actividades*/}
        {solicitudesActividades.length > 0 && (
          <View style={styles.activitiesContainer}>
            <Text style={styles.sectionTitle}>Solicitudes de Actividades</Text>
            {solicitudesActividades.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                style={styles.cardContainer}
                onPress={() => handleActivityPress(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.colorStrip, { backgroundColor: item.color || '#4a90e2' }]} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>{item.icon || '📊'}</Text>
                    <View style={styles.textColumn}>
                      <Text style={styles.cardTitle}>{item.nombre || 'Actividad'}</Text>
                      <Text style={styles.cardSubtitle}>Solicitud de actividad</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Modal para la grafica de comparacion*/}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Cabecera del Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Comparación: {selectedActivity?.nombre || 'Actividad'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Grsfica */}
            <View style={styles.chartWrapper}>
              <BarChart
                data={chartData}
                barWidth={60}
                noOfSections={4}
                barBorderRadius={4}
                frontColor="lightgray"
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
                height={200}
                width={width * 0.6} // Ajuste de ancho
                spacing={40} // Espacio entre barras
                initialSpacing={20}
                // Opciones estéticas adicionales
                isAnimated
              />
            </View>

            {/* Leyenda personalizada */}
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, {backgroundColor: '#177AD5'}]} />
                    <Text style={styles.legendText}>Yo</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, {backgroundColor: '#FF7F50'}]} />
                    <Text style={styles.legendText}>{profile?.nombre || 'Amigo'}</Text>
                </View>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Visualiza quién ha tenido mejor desempeño recientemente.
            </Text>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1, 
    backgroundColor: '#fff',
    paddingBottom: 40, 
  },
  headerContainer: { alignItems: 'center', marginBottom: 20 },
  headerBackground: {
    width: '100%',
    height: 140, 
    backgroundColor: '#E6E6FA', 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40, 
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', 
  },
  watermarkText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.6, 
    position: 'absolute',
    top: 40, 
  },
  profileInfoContainer: { alignItems: 'center', marginTop: -50 },
  avatarWrapper: {
    padding: 4, 
    backgroundColor: '#fff',
    borderRadius: 60,
    marginBottom: 10,
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  usernameText: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  emailText: { fontSize: 14, color: '#888' },

  activitiesContainer: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 15, color: '#000' },
  emptyText: { color: '#aaa', fontStyle: 'italic', marginTop: 10 },

  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff', 
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden', 
    borderWidth: 1,
    borderColor: '#f0f0f0', 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  colorStrip: { width: 6, height: '100%' },
  cardContent: { flex: 1, padding: 15, justifyContent: 'center', backgroundColor: '#FAFAFA' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { fontSize: 24, marginRight: 15 },
  textColumn: { justifyContent: 'center', flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#888' },

  footerContainer: {
    marginTop: 50, 
    paddingHorizontal: 20,
    marginTop: 'auto', 
  },
  deleteButton: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: '600' },

  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Fondo oscuro semitransparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Para que el texto no se empalme con la X
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    padding: 5,
  },
  chartWrapper: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 10,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});