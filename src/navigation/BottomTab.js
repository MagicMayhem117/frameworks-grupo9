import React, { useState, useEffect } from 'react'; // <--- Importar useState y useEffect
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';


import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreateHabitScreen from '../screens/CrateHabitScreen';
import ComunityScreen from '../screens/ComunityScreen';
import StreakHeader from '../components/StreakHeader';
import { useUser } from '../context/UserContext';
import { listenUserByEmail } from '../db/userQueries';

const Tab = createBottomTabNavigator();

export const BottomTab = () => {
    const { email } = useUser();
    const [solicitudesCount, setSolicitudesCount] = useState(0);
    useEffect(() => {
        if (!email) return;

        const unsubscribe = listenUserByEmail(email, (userData) => {
            if (userData && userData.solicitudes && Array.isArray(userData.solicitudes)) {

                setSolicitudesCount(userData.solicitudes.length);
            } else {

                setSolicitudesCount(0);
            }
        });

        // Limpiar
        return () => unsubscribe();
    }, [email]);

    return(
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{
                tabBarActiveTintColor: '#4F46E5',
                tabBarInactiveTintColor: 'gray',
            }}
            tabBarStyle={{
                backgroundColor: '#F5F5F5',
                borderTopWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
                height: 60,
            }}
            labelStyle={{
                fontSize: 12,
                fontWeight: 'bold',
            }}
        >
            <Tab.Screen
                name="Comunidad"
                component={ComunityScreen}
                options={{
                    title: 'Amigos',
                    headerRight: () => <StreakHeader />,
                    // circulo
                    tabBarBadge: solicitudesCount > 0 ? solicitudesCount : null,
                    tabBarBadgeStyle: { backgroundColor: '#E53E3E', color: 'white' },
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="users" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Mis Hábitos',
                    headerRight: () => <StreakHeader />,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Agregar"
                component={CreateHabitScreen}
                options={{
                    title: 'Nuevo Hábito',
                    headerRight: () => <StreakHeader />,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="plus-circle" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Stats"
                component={StatsScreen}
                options={{
                    title: 'Estadísticas',
                    headerRight: () => <StreakHeader />,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="bar-chart" color={color} size={size} />
                    ),
                }}
            />

            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: 'Ajustes',
                    headerRight: () => <StreakHeader />,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="cog" color={color} size={size} />
                    ),
                }}
            />

        </Tab.Navigator>
    );
};