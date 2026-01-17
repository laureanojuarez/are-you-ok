import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/FirebaseConfig";
import WellnessButton from "../../components/WellnessButton";
import TimerDisplay from "../../components/TimerDisplay";
import InfoSection from "../../components/InfoSection";

export default function Tab() {
  const setTime = 24 * 60 * 60;

  const [user, setUser] = useState(null);
  const [isWell, setIsWell] = useState(false);
  const [timeLeft, setTimeLeft] = useState(setTime);
  const [lastConfirmed, setLastConfirmed] = useState(null);

  const router = useRouter();

  // Handle Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return; // Don't load if not logged in

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

  const sendAlert = () => {
    console.log("Alerta enviada a contacto de emergencia:", alertMessage);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
