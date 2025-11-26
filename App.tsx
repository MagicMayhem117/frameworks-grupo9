import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTab } from './src/navigation/BottomTab';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import notifee, { EventType } from '@notifee/react-native';

import { UserProvider } from "./src/context/UserContext";

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import HomeScreen from './src/screens/HomeScreen';
import RachaScreen from './src/screens/RachaScreen';
import MonthlyShareScreen from './src/screens/MonthlyShareScreen';
import ActivityDetailScreen from './src/screens/ActivityDetailScreen';
import FriendProfileScreen from './src/screens/FriendProfileScreen';

import { StreakProvider } from './src/context/StreakContext';
import StreakHeader from './src/components/StreakHeader';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configuración de Google Sign-In
GoogleSignin.configure({
  webClientId: '919090861349-0fd8gtg71kbhvkb44q8asps91u7nchph.apps.googleusercontent.com',
});

const Stack = createNativeStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Detecta los cambios de estado de autenticación
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Se desuscribe al desmontar
  }, []);

  // <--- NUEVO: Listener para notificaciones cuando la app está abierta
  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          console.log('El usuario descartó la notificación');
          break;
        case EventType.PRESS:
          console.log('El usuario tocó la notificación', detail.notification);
          // Aquí podrías navegar, ej: navigation.navigate('Racha');
          // Nota: Para navegar aquí necesitarías una referencia de navegación global (ref),
          // pero por ahora con el console.log basta para probar.
          break;
      }
    });
  }, []);

  if (initializing) return null;

  return (
    <UserProvider>
      <StreakProvider>
        <NavigationContainer>
          <Stack.Navigator>
            {user ? (
              //  Bloque cuando el usuario ha iniciado sesión
              <>
                <Stack.Screen
                  name="BottomTab"
                  component={BottomTab}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{
                    title: 'Mis Hábitos',
                    headerRight: () => <StreakHeader />,
                  }}
                />

                <Stack.Screen
                  name="Racha"
                  component={RachaScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="MonthlyShare"
                  component={MonthlyShareScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="ActivityDetailScreen"
                  component={ActivityDetailScreen}
                  options={{
                    title: 'Detalle de Actividad',
                    headerShown: true,
                  }}
                />

                <Stack.Screen
                  name="FriendProfileScreen"
                  component={FriendProfileScreen}
                  options={{
                    title: 'Perfil de Amigo',
                    headerShown: true,
                  }}
                />

                <Stack.Screen
                  name="EditProfileScreen"
                  component={EditProfileScreen}
                  options={{ headerShown: false }}
                />
              </>
            ) : (
              //  Bloque cuando el usuario NO ha iniciado sesión
              <>
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Register"
                  component={RegisterScreen}
                  options={{ headerShown: false }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </StreakProvider>
    </UserProvider>
  );
};

export default App;