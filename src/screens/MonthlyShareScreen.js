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
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/Ionicons";
import ViewShot from "react-native-view-shot";
import Share from 'react-native-share';

import { useUser } from "../context/UserContext";
import { getUserByEmail, getTopActivitiesByAdherence, getTopActivityByType } from "../db/userQueries";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from "../firebase";
import MonthlyShareTemplate from '../sharingTemplates/MonthlyShareTemplate';

const { width, height } = Dimensions.get('window');

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

/**
 * MonthlyShareScreen
 * Displayed on login if the current date is the 1st of the month.
 * Allows user to create and share their monthly streak template.
 * After sharing (or skipping), navigates to Home.
 */
function MonthlyShareScreen({ navigation }) {
  const { email } = useUser();
  const [streak, setStreak] = useState(0);
  const [topActivities, setTopActivities] = useState([]);
  const [topBinary, setTopBinary] = useState(null);
  const [topQuantitative, setTopQuantitative] = useState(null);
  const [loading, setLoading] = useState(true);
  const viewShotRef = useRef(null);

  // Load streak and top activities from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (email) {
        try {
          const userData = await getUserByEmail(email);
          if (userData && userData.racha !== undefined) {
            setStreak(userData.racha);
          } else {
            setStreak(0);
          }

          // Fetch top 3 activities by adherence
          const activityIds = userData?.actividades || [];
          if (activityIds.length > 0) {
            const top3 = await getTopActivitiesByAdherence(activityIds, 3);
            setTopActivities(top3);

            // Fetch top binary activity
            const topBin = await getTopActivityByType(activityIds, 'binary');
            setTopBinary(topBin);

            // Fetch top quantitative activity
            const topQuant = await getTopActivityByType(activityIds, 'quantitative');
            setTopQuantitative(topQuant);
          }
        } catch (error) {
          console.error("Error al obtener datos:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [email]);

  // previous month name (most relevant totals are for the month we just finished)
  const prevMonthIndexRaw = new Date().getMonth() - 1;
  const prevMonthIndex = prevMonthIndexRaw >= 0 ? prevMonthIndexRaw : 11;
  const prevMonthName = meses[prevMonthIndex];

  const markMonthlyShareDismissed = async () => {
    try {
      const userData = await getUserByEmail(email);
      if (userData && userData.id) {
        const userRef = doc(db, "Usuarios", userData.id);
        await updateDoc(userRef, { monthlyShareDismissed: true });
      }
    } catch (error) {
      console.error("Error marking dismissal:", error);
    }
  };

  const handleShare = async () => {
    try {
      if (!viewShotRef.current) {
        Alert.alert('Espere', 'La imagen aún se está cargando, intente de nuevo.');
        return;
      }

      const uri = await viewShotRef.current.capture();
      const shareOptions = {
        title: 'Mi Racha Mensual',
        message: `¡He logrado una racha de ${streak} días! ¿Puedes superarme?`,
        url: uri,
        type: 'image/jpeg',
      };

      await Share.open(shareOptions);
      // After sharing, mark as dismissed and navigate to the main tab navigator
      await markMonthlyShareDismissed();
      navigation.replace('BottomTab');
    } catch (error) {
      console.error("Error al compartir:", error);
      if (error && error.message !== "User did not share") {
        Alert.alert('Error', 'No se pudo generar la imagen: ' + error.message);
      }
    }
  };

  const handleSkip = async () => {
    // Mark as dismissed and skip to the main tab navigator
    await markMonthlyShareDismissed();
    navigation.replace('BottomTab');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Hidden ViewShot for image capture */}
      <View
        collapsable={false}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 375,
          height: 600,
          zIndex: -10,
          opacity: 0.0,
        }}
      >
        <ViewShot
          ref={viewShotRef}
          options={{ format: "jpg", quality: 0.9, result: "tmpfile" }}
          style={{ backgroundColor: '#fff' }}
        >
          <MonthlyShareTemplate
            streak={streak}
            topActivities={topActivities}
            topBinary={topBinary}
            topQuantitative={topQuantitative}
            monthName={prevMonthName}
          />
        </ViewShot>
      </View>

      {/* Background and gradient */}
      <View style={styles.backgroundBase} />

      <View style={styles.topCurveContainer}>
        <View style={styles.topCurveCircle} />
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(139, 168, 142, 0.3)', '#8ba88e']}
        locations={[0, 0.4, 0.8]}
        style={styles.gradientOverlay}
      />

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color="#f0f4ef" />
            <Text style={styles.loaderText}>Cargando tu racha...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            <View style={styles.messageContainer}>
              <Text style={styles.messageTitle}>¡Nuevo mes, nueva oportunidad!</Text>
              <Text style={styles.messageBody}>
                Felicidades por tu racha de {streak} días. Comparte tu progreso con tus amigos.
              </Text>
            </View>

            <View style={styles.streakPreview}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>Días de racha</Text>
            </View>

            {/* Top Activities Section */}
            {topActivities.length > 0 && (
              <View style={styles.activitiesSection}>
                <Text style={styles.sectionTitle}>Tus mejores hábitos</Text>
                {topActivities.map((activity, index) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <Text style={styles.activityIcon}>{activity.icon || '🔥'}</Text>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityName} numberOfLines={1}>
                        {activity.nombre || activity.name || 'Actividad'}
                      </Text>
                      <Text style={styles.activityAdherence}>
                        {activity.skippedDays === 0 ? '100% días completados' : `${activity.skippedDays} días saltados`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Top Binary Activity */}
            {topBinary && (
              <View style={styles.specialActivitySection}>
                <Text style={styles.sectionTitle}>Tu mejor hábito de Sí/No</Text>
                <View style={styles.specialActivityItem}>
                  <Text style={styles.activityIcon}>{topBinary.icon || '✓'}</Text>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{topBinary.nombre || topBinary.name}</Text>
                    <Text style={styles.activityAdherence}>{`${prevMonthName.charAt(0).toUpperCase() + prevMonthName.slice(1)}: ${
                      typeof topBinary[prevMonthName] === 'number' ? topBinary[prevMonthName] : (topBinary[prevMonthName] || 0)
                    } días`}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Top Quantitative Activity */}
            {topQuantitative && (
              <View style={styles.specialActivitySection}>
                <Text style={styles.sectionTitle}>Tu mejor hábito cuantitativo</Text>
                <View style={styles.specialActivityItem}>
                  <Text style={styles.activityIcon}>{topQuantitative.icon || '📊'}</Text>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{topQuantitative.nombre || topQuantitative.name}</Text>
                    <Text style={styles.activityAdherence}>{`${prevMonthName.charAt(0).toUpperCase() + prevMonthName.slice(1)}: ${
                      typeof topQuantitative[prevMonthName] === 'number' ? topQuantitative[prevMonthName] : (topQuantitative[prevMonthName] || 0)
                    } ${topQuantitative["unit"]}`}</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Footer buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.shareButton}
          activeOpacity={0.8}
          onPress={handleShare}
          disabled={loading}
        >
          <Icon name="share-social" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.shareButtonText}>COMPARTIR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          activeOpacity={0.8}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>SALTAR</Text>
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
    height: height * 0.35,
    overflow: 'hidden',
    zIndex: 0,
  },
  topCurveCircle: {
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
    backgroundColor: 'rgba(92, 112, 93, 0.8)',
    position: 'absolute',
    top: -width * 0.9,
    left: -(width * 0.25),
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  scrollContainer: {
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#f0f4ef',
    fontWeight: '500',
  },
  messageContainer: {
    marginBottom: 40,
  },
  messageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f0f4ef',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 30,
  },
  messageBody: {
    fontSize: 16,
    color: '#f0f4ef',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  streakPreview: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#f0f4ef',
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  streakLabel: {
    fontSize: 18,
    color: '#f0f4ef',
    fontWeight: '500',
    marginTop: 8,
    opacity: 0.85,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    zIndex: 2,
    gap: 12,
  },
  shareButton: {
    backgroundColor: 'rgba(122, 150, 125, 0.8)',
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  shareButtonText: {
    color: '#f0f4ef',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 1,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  skipButtonText: {
    color: '#f0f4ef',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  activitiesSection: {
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
  },
  specialActivitySection: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f0f4ef',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  specialActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    textAlign: 'center',
    width: 40,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f0f4ef',
  },
  activityAdherence: {
    fontSize: 12,
    color: 'rgba(240,244,239,0.7)',
    marginTop: 2,
  },
});

export default MonthlyShareScreen;