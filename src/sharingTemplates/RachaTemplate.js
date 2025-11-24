import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get('window');

// Definimos un tamaño fijo para la captura
const CARD_WIDTH = 1080 / 3;
const CARD_HEIGHT = 1920 / 3;

export default function RachaTemplate({ streak, username }) {

  // Logica para obtener el título dinamico
  const getStreakTitle = (day) => {
    // 1. Mensajes especificos para dias clave
    const specificMessages = {
      1: "¡Primer día! El fuego acaba de encenderse 🔥",
      2: "¡Día 2 y ya estás de vuelta! Esto empieza a oler a compromiso",
      3: "¡Estás en llamas! Cuidado que quema",
      4: "Ya no es casualidad, ¿eh?",
      5: "¡Medio camino a la semana! No te relajes ahora",
      6: "Tus amigos ya están sospechando que eres un robot",
      7: "¡SEMANA COMPLETA! Bienvenido al club de los que no abandonan 🏆",
      8: "La llama ya no se apaga ni con agua",
      9: "Estás a un paso de que te enviemos flores",
      10: "Ya puedes presumirlo en el grupo familiar",
      14: "¡2 SEMANAS! Tu racha ya tiene más compromiso que la mayoría de las relaciones",
      15: "Mitad de mes sin fallar. Eres un ejemplo tóxico de disciplina",
      20: "Tu racha ya tiene edad para manejar",
      25: "¡Tu fuerza de voluntad ya da miedo!",
      30: "¡UN MES EN LLAMAS!",
      40: "Esto ya no es una racha, es un estilo de vida",
      45: "Hasta tu abuela está orgullosa (y un poco preocupada)",
      50: "Eres la persona que los demás usan de excusa para no intentarlo",
      60: "Dos meses seguidos. Tu racha ya paga impuestos",
      70: "Tu fuerza de voluntad tiene más experiencia que muchos empleados",
      80: "Ya no es disciplina, es obsesión (y nos encanta)",
      90: "¡Tres meses sin fallar! Eres básicamente un monje con celular",
      99: "Mañana será legendario… No nos falles",
      100: "¡Esto ya merece un documental de Netflix!",
      123: "Tu racha ya sabe caminar y decir mamá",
      150: "Tu compromiso asusta a la gente normal",
      200: "Eres la razón por la que los demás se sienten mal consigo mismos",
      250: "Tu racha ya tiene más estabilidad que el mercado cripto",
      300: "¡Diez meses seguidos! Eres inmortal",
      365: "¡UN AÑO EN LLAMAS! Eres leyenda.",
      400: "Tu racha ya tiene más experiencia que tú en muchas cosas",
      500: "Esto ya no es humano. ¿Eres un bot?",
      666: "El número de la bestia. Tu dedicación da miedo literal",
      730: "¡2 AÑOS! Tu racha es legendaria",
      1000: "¡MIL DÍAS! Esto merece una estatua."
    };

    if (specificMessages[day]) {
      return specificMessages[day];
    }

    // 2. Mensajes aleatorios para los días intermedios
    const randomMessages = [
      "Tu racha te mira raro si hoy no apareces",
      "Tu yo del futuro te está aplaudiendo ahora mismo",
      "Hay gente que lleva menos tiempo en su trabajo que tú en esta racha",
      "Tu racha está en llamas",
      "¡Estás en llamas!",
      "Si tu racha fuera una planta, ya sería un árbol antiguo",
      "Tu dedicación debería tener su propio himno nacional"
    ];

    // Seleccionamos basado en el número del día para que sea consistente
    // (Ej: el dia 11 siempre mostrara el mismo mensaje, no cambiara al azar cada vez que abras)
    return randomMessages[day % randomMessages.length];
  };

  const titleText = getStreakTitle(streak);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1BFFFF', '#2E3192']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Icon name="flame" size={80} color="#FFD700" style={styles.iconShadow} />

        {/* Texto dinamico */}
        <Text style={styles.title}>{titleText}</Text>

        <View style={styles.streakCircle}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.daysLabel}>DÍAS</Text>
        </View>

        <Text style={styles.subtitle}>
            He mantenido mi disciplina por {streak} días seguidos.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Puedes superarme?</Text>

          <Image
            source={require('../assets/Logo_0.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 375,
    height: 600,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25, // Un poco más de padding
  },
  iconShadow: {
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22, // Reducido un poco para acomodar textos largos
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1, // Reducido ligeramente
    marginBottom: 25,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 28, // Altura de línea para mejor legibilidad en textos de 2 líneas
  },
  streakCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 30,
  },
  streakNumber: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#FFFFFF',
    includeFontPadding: false,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  daysLabel: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: '90%',
  },
  footer: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingTop: 20,
    width: '100%',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  logo: {
    width: 140,
    height: 60,
  }
});