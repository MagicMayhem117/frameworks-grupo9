import notifee, { TriggerType, RepeatFrequency, AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

export const NotificationManager = {

  async scheduleDailyNotification(isEnabled) {
    // Limpieza
    await notifee.cancelAllNotifications();
    console.log("🔄 Programación anterior limpiada.");

    if (!isEnabled) return;

    // 2. verificar permisos basicos
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus < 1) {
      console.log('❌ El usuario denegó los permisos de notificación');
      return;
    }

    // verificar Permisos
    if (Platform.OS === 'android') {
      const alarmSettings = await notifee.getNotificationSettings();
      if (!alarmSettings.android.alarm) {
        console.log('⚠️ Falta permiso de Alarmas Exactas. Abriendo ajustes...');
        await notifee.openAlarmPermissionSettings();
        return;
      }
    }

    // Crear el Canal
    const channelId = await notifee.createChannel({
      id: 'daily_reminder',
      name: 'Recordatorios Diarios',
      sound: 'default',
      importance: AndroidImportance.HIGH, // Para que suene y vibre
    });

    // Configurar la Hora
    const date = new Date(Date.now());

    date.setHours(9);   // <--- HORA (24h)
    date.setMinutes(0); // <--- MINUTOS
    date.setSeconds(0);


    if (date.getTime() <= Date.now()) {
      date.setDate(date.getDate() + 1);
    }

    // Trigger
    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
      alarmManager: true,
    };

    console.log("✅ Notificación programada OFICIALMENTE para:", date.toLocaleString());

    // Notificación
    try {
      await notifee.createTriggerNotification(
        {
          id: 'daily_habit_reminder',
          title: '¡Es hora de tu racha! 🔥',
          body: 'No olvides registrar tus hábitos hoy en DailyTrack.',
          android: {
            channelId,
            smallIcon: 'ic_launcher',
            pressAction: {
              id: 'default',
            },
          },
        },
        trigger,
      );
    } catch (error) {
      console.error("❌ Error creando la notificación:", error);
    }
  },

  //prueba
  async testNotification() {
    await notifee.requestPermission();
    const channelId = await notifee.createChannel({
      id: 'test_channel',
      name: 'Canal de Prueba',
      importance: AndroidImportance.HIGH,
    });
    await notifee.displayNotification({
      title: '🔔 Prueba Exitosa',
      body: 'Las notificaciones funcionan correctamente.',
      android: { channelId, pressAction: { id: 'default' } },
    });
  }
};