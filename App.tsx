import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTab} from './src/navigation/BottomTab';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

import { UserProvider } from "./src/context/UserContext";

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import HomeScreen from './src/screens/HomeScreen';
import RachaScreen from './src/screens/RachaScreen';

import { StreakProvider } from './src/context/StreakContext';
import StreakHeader from './src/components/StreakHeader';

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
  <UserProvider>
    <StreakProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            // Bloque para cuando el usuario SÍ ha iniciado sesión
            <>
              {/* Pantalla principal del primer código (prioridad) */}
              <Stack.Screen
                name="BottomTab"
                component={BottomTab}
                options={{ headerShown: false }}
              />

              {/* Pantallas del segundo código, ahora parte del mismo stack */}
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: 'Mis Hábitos',
                  headerRight: () => <StreakHeader />,
                }}
              />
              <Stack.Screen name="Racha" component={RachaScreen} />

              {/* Pantalla EditProfileScreen del primer código, ahora dentro de la lógica de usuario */}
              <Stack.Screen
                name="EditProfileScreen"
                component={EditProfileScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            // Bloque para cuando el usuario NO ha iniciado sesión
            // Esta parte era idéntica en ambos códigos
            <>
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      </StreakProvider>
    </UserProvider>
  );
};


export default App;