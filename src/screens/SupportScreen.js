import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const SupportScreen = () => {
  const navigation = useNavigation();

  // Estados para controlar el despliegue de las secciones legales
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/Logo_0.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>DailyTrack</Text>
            <Text style={styles.appVersion}>Versión 1.0.1</Text>
            <Text style={styles.appSlogan}>Construye tu mejor versión, un día a la vez.</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>

            <View style={styles.card}>
              <Text style={styles.question}>¿Cómo creo un nuevo hábito?</Text>
              <Text style={styles.answer}>
                Ve a la pantalla principal y pulsa el botón "+" en la esquina inferior derecha. Selecciona una opcion, un icono y define tus metas diarias.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.question}>¿Puedo exportar mis datos?</Text>
              <Text style={styles.answer}>
                No.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.question}>¿Es gratis DailyTrack?</Text>
              <Text style={styles.answer}>
                Sí, las funciones principales son gratuitas. DailyTrack Premium ofrece estadísticas avanzadas y temas personalizados.
              </Text>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Contacto</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>¿Tienes algún problema o sugerencia? Escríbenos a:</Text>
              <TouchableOpacity>
                <Text style={styles.emailLink}>soporte@dailytrack.com</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Legal</Text>

            {/* Política de Privacidad Desplegable */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => setShowPrivacy(!showPrivacy)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.question}>Política de Privacidad</Text>
                <Icon
                  name={showPrivacy ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </View>
              {showPrivacy && (
                <Text style={styles.answer}>
                  En DailyTrack, valoramos tu privacidad. Tus datos se almacenan de forma segura y solo se utilizan para mejorar tu experiencia de seguimiento de hábitos. No compartimos tu información personal con terceros sin tu consentimiento.
                </Text>
              )}
            </TouchableOpacity>

            {/* Términos y Condiciones Desplegable */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => setShowTerms(!showTerms)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.question}>Términos y Condiciones</Text>
                <Icon
                  name={showTerms ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#666"
                />
              </View>
              {showTerms && (
                <Text style={styles.answer}>
                  Al utilizar DailyTrack, aceptas usar la aplicación de manera responsable. Esta herramienta está diseñada para uso personal y de automejora. Nos reservamos el derecho de actualizar los servicios para ofrecerte mejores funcionalidades.
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2024 DailyTrack Inc.</Text>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 10,
  },
  backButton: {
    padding: 5,
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5A4DF3',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  appSlogan: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#f8f9fd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  // Nuevo estilo para el header dentro de la tarjeta
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  answer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 5, // Un poco de espacio cuando se despliega
  },
  infoCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  emailLink: {
    fontSize: 16,
    color: '#5A4DF3',
    fontWeight: '600',
    marginTop: 5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },
});

export default SupportScreen;