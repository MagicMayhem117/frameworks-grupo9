import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Esta es la pantalla de perfil, por implementar</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, marginBottom: 20 },
});

export default ProfileScreen;