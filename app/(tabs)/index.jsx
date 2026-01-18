import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/FirebaseConfig";
import WellnessButton from "../../components/WellnessButton";
import TimerDisplay from "../../components/TimerDisplay";
import InfoSection from "../../components/InfoSection";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// Configurar cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Tab() {
  const setTime = 24 * 60 * 60;

  const [user, setUser] = useState(null);
  const [isWell, setIsWell] = useState(false);
  const [timeLeft, setTimeLeft] = useState(setTime);
  const [lastConfirmed, setLastConfirmed] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  const router = useRouter();

  // Solicitar permisos de notificaciones
  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listener para notificaciones recibidas
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notificación recibida:", notification);
      });

    // Listener para cuando el usuario toca la notificación
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notificación tocada:", response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current,
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Handle Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadLastConfirmed = async () => {
      const value = await AsyncStorage.getItem("lastConfirmed");
      if (value) setLastConfirmed(new Date(value));

      const endTimestamp = await AsyncStorage.getItem("endTimestamp");
      if (endTimestamp) {
        const now = new Date();
        const end = parseInt(endTimestamp, 10);
        const diff = Math.floor((end - now.getTime()) / 1000);
        if (diff > 0) {
          setIsWell(true);
          setTimeLeft(diff);
        }
      }
    };
    loadLastConfirmed();
  }, [user]);

  useEffect(() => {
    let interval = null;

    if (isWell && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsWell(false);
      setTimeLeft(setTime);
      AsyncStorage.removeItem("endTimestamp");
      sendAlert();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWell, timeLeft]);

  const handlePress = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsWell(true);
    const now = new Date();
    setLastConfirmed(now);
    await AsyncStorage.setItem("lastConfirmed", now.toISOString());

    const endTimestamp = now.getTime() + setTime * 1000;
    await AsyncStorage.setItem("endTimestamp", endTimestamp.toString());
    setTimeLeft(setTime);

    // Programar notificación para 24 horas después
    await scheduleCheckInNotification();
  };

  const scheduleCheckInNotification = async () => {
    // Cancelar notificaciones previas
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Programar notificación para 24 horas (86400 segundos)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "¿Estás bien? 🔔",
        body: "Han pasado 24 horas. Es hora de confirmar que estás bien.",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: 24 * 60 * 60, // 24 horas
      },
    });

    console.log("Notificación programada para 24 horas");
  };

  const formatTime = (date) => {
    if (!date) return "--/--/-- a las --:--";
    const pad = (n) => n.toString().padStart(2, "0");
    return `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()} a las ${date.getHours()}:${pad(date.getMinutes())}`;
  };

  const alertMessage =
    "Persona X no ha confirmado que está bien en el tiempo establecido. Por favor, verifica su estado.";

  const sendAlert = async () => {
    console.log("Alerta enviada a contacto de emergencia:", alertMessage);

    // Enviar notificación inmediata
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Alerta de Emergencia",
        body: "No has confirmado tu estado. Se enviará alerta a tus contactos de emergencia.",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // Inmediato
    });
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />

        <WellnessButton onPress={handlePress} />

        {isWell && <TimerDisplay timeLeft={timeLeft} />}

        <InfoSection description="Si no das señal de vida despues de 48 horas, se enviará una alerta a tu contacto de emergencia." />

        <InfoSection
          label="Última vez que dijiste que estabas bien:"
          value={formatTime(lastConfirmed)}
        />
      </View>
    </SafeAreaProvider>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("No se obtuvieron permisos para notificaciones push");
      return;
    }
  } else {
    alert("Debes usar un dispositivo físico para las notificaciones push");
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
