
import React from 'react';
import { View, Text } from 'react-native';

export const RachaWidget = ({ widgetInfo }) => {
  const { widgetName, ...props } = widgetInfo;
  const streak = props.streak || 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Racha Actual</Text>
      <Text style={styles.streakText}>{streak}</Text>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
  },
  title: {
    fontSize: 16,
    color: '#000000',
  },
  streakText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000000',
  },
};
