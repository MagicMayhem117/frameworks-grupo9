import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Share,
  Alert,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/Ionicons";

//Imports de Firebase y Contexto
import { useUser } from "../context/UserContext";
import { getUserByEmail } from "../db/userQueries";

const { width, height } = Dimensions.get('window');

export default function RachaScreen({ navigation }) {
  // 1. Obtener el email del usuario actual
  const { email } = useUser();

  // 2. Estados para manejar la racha y la carga
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // 3. Cargar datos desde Firebase
  useEffect(() => {
    const fetchStreak = async () => {
      if (email) {
        try {
          const userData = await getUserByEmail(email);
          if (userData && userData.racha !== undefined) {
            setStreak(userData.racha);
          } else {
            setStreak(0);
          }
        } catch (error) {
          console.error("Error al obtener racha:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStreak();
  }, [email]);

  // Funcion para manejar el boton de atras
  const handleGoBack = () => {
    if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.log('No hay historial de navegación.');
    }
  };

  // Funcion para manejar el boton compartir
  const handleShare = async () => {
    try {
      const result = await Share.share({
        // Mensaje dinamico usando la variable streak
        message: `¡He logrado una racha de ${streak} días! ¿Puedes superarme?`,
        title: 'Mi Racha',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Compartido en: ' + result.activityType);
        } else {
          console.log('Compartido exitosamente');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Compartir cancelado');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* fondo base verde */}
      <View style={styles.backgroundBase} />

      {/* curva superior Beige */}
      <View style={styles.topCurveContainer}>
        <View style={styles.topCurveCircle} />
      </View>

      {/* Gradiente suave para unificar */}
      <LinearGradient
        colors={['transparent', 'rgba(139, 168, 142, 0.3)', '#8ba88e']}
        locations={[0, 0.4, 0.8]}
        style={styles.gradientOverlay}
      />

      {/* boton de regreso */}
      <View style={styles.headerSafeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={30} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        <View style={styles.streakContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#f0f4ef" />
          ) : (
            <>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>Días de racha</Text>
            </>
          )}
        </View>
      </View>

      {/* Footer con boton */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleShare}
          disabled={loading} // Deshabilita el botón si esta cargando
        >
          <Text style={styles.buttonText}>COMPARTIR PROGRESO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8ba88e',
  },
  backgroundBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#8ba88e',
  },
  topCurveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    overflow: 'hidden',
    zIndex: 0,
  },
  topCurveCircle: {
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
    backgroundColor: '#f7f3e8',
    position: 'absolute',
    top: -width * 0.9,
    left: -(width * 0.25),
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  // Estilos del Header / boton atras
  headerSafeArea: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    zIndex: 50,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  streakContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: 140,
    fontWeight: 'bold',
    color: '#f0f4ef',
    includeFontPadding: false,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  streakLabel: {
    fontSize: 24,
    color: '#f0f4ef',
    fontWeight: '500',
    marginTop: 10,
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    zIndex: 2,
  },
  button: {
    backgroundColor: 'rgba(122, 150, 125, 0.6)',
    paddingVertical: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonText: {
    color: '#f0f4ef',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 1.5,
  },
});