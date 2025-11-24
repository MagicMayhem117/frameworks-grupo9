import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/Ionicons";

// Imports para compartir imagenes
import ViewShot from "react-native-view-shot";
import Share from 'react-native-share';

// Imports de Firebase y Contexto
import { useUser } from "../context/UserContext";
import { getUserByEmail } from "../db/userQueries";

// Importamos la plantilla nueva
import RachaTemplate from '../sharingTemplates/RachaTemplate';

const { width, height } = Dimensions.get('window');

export default function RachaScreen({ navigation }) {
  // 1. Obtener el email del usuario actual
  const { email } = useUser();

  // 2. Estados para manejar la racha y la carga
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Ref inicializado en null
  const viewShotRef = useRef(null);

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

  const handleGoBack = () => {
    if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      console.log('No hay historial de navegación.');
    }
  };

  // Funcion para manejar el boton compartir con IMAGEN
  const handleShare = async () => {
    try {
      // Verificación de seguridad
      if (!viewShotRef.current) {
        Alert.alert('Espere', 'La imagen aún se está cargando, intente de nuevo.');
        return;
      }

      console.log("Iniciando captura...");

      // 1. Capturamos usando tmpfile (Archivo temporal)
      // Esto evita el error de memoria/URI null en Android
      const uri = await viewShotRef.current.capture();

      console.log("Imagen guardada en:", uri);

      const shareOptions = {
        title: 'Mi Racha',
        message: `¡He logrado una racha de ${streak} días! ¿Puedes superarme?`,
        url: uri, // Pasamos la ruta del archivo directamente (file://...)
        type: 'image/jpeg',
      };

      // 2. Abrimos el menu nativo avanzado
      await Share.open(shareOptions);

    } catch (error) {
      console.error("Error detallado al compartir:", error);

      // Ignoramos el error si el usuario simplemente cerro el menu de compartir
      if (error && error.message !== "User did not share") {
        Alert.alert('Error', 'No se pudo generar la imagen: ' + error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ZONA OCULTA (PHANTOM VIEW)
        Cambios clave:
        style: Use zIndex: -10 y position absolute para esconderlo
           detras del fondo, pero asegurando que Android lo renderice.
      */}
      <View
        collapsable={false}
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 375, // Mismo ancho que definimos en el Template
            height: 600, // Mismo alto que definimos en el Template
            zIndex: -10, // Lo mandamos al fondo, detrás detodo
            opacity: 0.0, // Totalmente invisible (pero existe en el árbol de vistas)
        }}
      >
        <ViewShot
            ref={viewShotRef}
            options={{ format: "jpg", quality: 0.9, result: "tmpfile" }}
            style={{ backgroundColor: '#fff' }}
        >
            <RachaTemplate streak={streak} />
        </ViewShot>
      </View>

      {/* UI VISIBLE */}

      <View style={styles.backgroundBase} />

      <View style={styles.topCurveContainer}>
        <View style={styles.topCurveCircle} />
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(139, 168, 142, 0.3)', '#8ba88e']}
        locations={[0, 0.4, 0.8]}
        style={styles.gradientOverlay}
      />

      <View style={styles.headerSafeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={30} color="#374151" />
        </TouchableOpacity>
      </View>

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

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleShare}
          disabled={loading}
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