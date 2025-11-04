import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';

import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreateHabitScreen from '../screens/CrateHabitScreen';
import ComunityScreen from '../screens/ComunityScreen';
import StreakHeader from '../components/StreakHeader';


const Tab = createBottomTabNavigator();

export const BottomTab = () => {
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
                    headerShown: false,
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

                    tabBarIcon: ({ color, size }) => (
                        <Icon name="cog" color={color} size={size} />
                    ),
                }}
            />

        </Tab.Navigator>
    );
};