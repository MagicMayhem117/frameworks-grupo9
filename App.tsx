import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';

const App = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Título principal */}
            <View style={styles.section}>
                <Text style={styles.mainTitle}>⚛️ React Native ⚛️</Text>
            </View>
            
            {/* Nombres del equipo */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👥 Equipo 9</Text>
                <View style={styles.listContainer}>
                    <Text style={styles.listItem}>1. Lopez Zavala Jesus Enrique</Text>
                    <Text style={styles.listItem}>2. Martell Rodríguez Diego</Text>
                    <Text style={styles.listItem}>3. Barrios Martínez Alejandro</Text>
                    <Text style={styles.listItem}>4. Dwyer Morris Mateo David</Text>
                </View>
            </View>
            
            {/* Sección de descripción */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📝 Descripción</Text>
                <Text style={styles.description}>
                    Esta es una aplicación de ejemplo creada con React Native. 
                    Muestra cómo organizar diferentes secciones en una interfaz 
                    limpia y atractiva, con texto centrado y elementos visuales modernos.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    section: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#3498db',
        marginBottom: 15,
        textAlign: 'center',
    },
    listContainer: {
        width: '100%',
    },
    listItem: {
        fontSize: 18,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    description: {
        fontSize: 16,
        lineHeight: 22,
        color: '#555',
        textAlign: 'justify',
    },
});

export default App;