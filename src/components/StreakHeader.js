import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStreak } from '../context/StreakContext';
import { useUser } from "../context/UserContext";
import { getUserByEmail } from "../db/userQueries";
import { listenUserByEmail } from "../db/userQueries";


const StreakHeader = () => {
  //const { streak } = useStreak();
  const { email } = useUser();
  const navigation = useNavigation();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!email) return;

    const unsubscribe = listenUserByEmail(email, (userData) => {
      if (userData && userData.racha !== undefined) {
        setStreak(userData.racha); // actualiza la racha
      } else {
        setStreak(0);
      }
    });

    return () => unsubscribe();
  }, [email]);


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