import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStreak } from '../context/StreakContext';

const StreakHeader = () => {
  const { streak } = useStreak();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('Racha')}
    >
      <Text style={styles.icon}>🔥</Text>
      <Text style={styles.text}>{`${streak} Días`}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF', // bg-indigo-50
    borderColor: '#C7D2FE', // border-indigo-200
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  icon: {
    fontSize: 16,
    lineHeight: 20,
    marginRight: 6,
  },
  text: {
    color: '#4F46E5', // text-indigo-600
    fontWeight: '600',
    fontSize: 14,
  },
});

export default StreakHeader;