import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Fixed capture size (match other template)
const WIDTH = 375;
const HEIGHT = 600;

export default function MonthlyShareTemplate({ streak, topActivities = [], topBinary = null, topQuantitative = null, monthName }) {
  const cap = (s) => String(s).charAt(0).toUpperCase() + String(s).slice(1);
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1BFFFF", "#2E3192"]} style={styles.gradient}>
        <Text style={styles.header}>Mi resumen mensual</Text>

        <View style={styles.streakBox}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>Días</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top {topActivities.length} hábitos</Text>
          {topActivities.map((a, i) => (
            <View key={a.id || i} style={styles.row}>
              <Text style={styles.icon}>{a.icon || '🔥'}</Text>
              <View style={{flex:1}}>
                <Text style={styles.name}>{a.nombre || a.name}</Text>
                <Text style={styles.small}>{a.skippedDays === 0 ? '100% días completados' : `${a.skippedDays} días saltados`}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionSmall}>
          {topBinary && (
            <View style={styles.rowSmall}>
              <Text style={styles.icon}>{topBinary.icon || '✓'}</Text>
              <View style={{flex:1}}>
                <Text style={styles.name}>{topBinary.nombre || topBinary.name}</Text>
                <Text style={styles.small}>{cap(monthName)}: {typeof topBinary[monthName] === 'number' ? topBinary[monthName] : (topBinary[monthName] || 0)}</Text>
              </View>
            </View>
          )}

          {topQuantitative && (
            <View style={styles.rowSmall}>
              <Text style={styles.icon}>{topQuantitative.icon || '📊'}</Text>
              <View style={{flex:1}}>
                <Text style={styles.name}>{topQuantitative.nombre || topQuantitative.name}</Text>
                <Text style={styles.small}>{cap(monthName)}: {typeof topQuantitative[monthName] === 'number' ? topQuantitative[monthName] : (topQuantitative[monthName] || 0)}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Compartido desde DailyTrack</Text>
          <Image source={require('../assets/Logo_0.png')} style={styles.logo} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: WIDTH, height: HEIGHT, backgroundColor: '#fff' },
  gradient: { flex: 1, padding: 18, justifyContent: 'space-between' },
  header: { color: '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  streakBox: { alignItems: 'center', marginTop: 6 },
  streakNumber: { color: '#fff', fontSize: 76, fontWeight: '900' },
  streakLabel: { color: '#fff', fontSize: 14, opacity: 0.9 },
  section: { backgroundColor: 'rgba(255,255,255,0.06)', padding: 10, borderRadius: 10 },
  sectionSmall: { marginTop: 12 },
  sectionTitle: { color: '#fff', fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  rowSmall: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  icon: { fontSize: 22, width: 36, textAlign: 'center' },
  name: { color: '#fff', fontWeight: '700' },
  small: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  footer: { alignItems: 'center' },
  footerText: { color: '#fff', fontSize: 12, marginBottom: 6 },
  logo: { width: 120, height: 40, resizeMode: 'contain' },
});
