import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useStreak } from '../context/StreakContext'; // <-- CAMBIO AQUÍ

const RachaScreen = () => {
  const { streak, canIncrement, incrementStreak } = useStreak();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Racha Actual</Text>
      <Text style={styles.streakText}>{streak}</Text>
      <Button
        title="¡Completé mi día!"
        onPress={incrementStreak}
        disabled={!canIncrement}
      />
      {!canIncrement && (
        <Text style={styles.message}>¡Vuelve mañana para continuar tu racha!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  streakText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});

export default RachaScreen;
