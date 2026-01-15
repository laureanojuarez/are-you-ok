import { StatusBar } from "expo-status-bar";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const setTime = 60;

  const [isWell, setIsWell] = useState(false);
  const [timeLeft, setTimeLeft] = useState(setTime);
  const [lastConfirmed, setLastConfirmed] = useState(null);

  useEffect(() => {
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
  }, []);

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
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWell, timeLeft]);

  const handlePress = async () => {
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

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />

        {isWell ? (
          <View style={styles.circle}>
            <Text style={styles.timerText}>Vuelve en {timeLeft} segundos</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handlePress}
          >
            <Text style={styles.buttonText}>Estoy Bien</Text>
          </TouchableOpacity>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>
            Última vez que dijiste que estabas bien:
          </Text>
          <Text style={styles.infoTime}>{formatTime(lastConfirmed)}</Text>
        </View>
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
  circle: {
    backgroundColor: "#fff",
    width: 256,
    height: 256,
    borderRadius: 128,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  timerText: {
    fontSize: 24,
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
    color: "#222",
  },
  button: {
    backgroundColor: "#bbf7d0",
    width: 256,
    height: 256,
    borderRadius: 128,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 24,
    fontStyle: "italic",
    color: "#166534",
    textAlign: "center",
  },
  infoContainer: {
    marginTop: 32,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  infoLabel: {
    fontSize: 18,
    color: "#6b7280",
    fontStyle: "italic",
    textAlign: "center",
  },
  infoTime: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
    textAlign: "center",
  },
});
