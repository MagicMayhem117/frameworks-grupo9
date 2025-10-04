import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen'; // Crearemos esta pantalla enseguida
import ProfileScreen from './screens/ProfileScreen'; // Perfil

// En App.tsx, después de las importaciones
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '919090861349-0fd8gtg71kbhvkb44q8asps91u7nchph.apps.googleusercontent.com',
});

const Stack = createNativeStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Manejador para los cambios de estado de autenticación
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Se desuscribe al desmontar
  }, []);

  if (initializing) return null; // O un componente de carga

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Si el usuario ha iniciado sesión, muestra la pantalla principal
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Mis Hábitos' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
        ) : (
          // Si no, muestra las pantallas de autenticación
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;