import { StatusBar } from 'expo-status-bar';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css'
import { useEffect, useState } from 'react';

export default function App() {
  const [isWell, setIsWell] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [lastConfirmed, setLastConfirmed] = useState(null);

  useEffect(() => {
    let interval = null;

    if (isWell && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsWell(false);
      setTimeLeft(15); // Reset timer for next time
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWell, timeLeft]);

  const handlePress = () => {
    setIsWell(true);
    setLastConfirmed(new Date());
  };

  const formatTime = (date) => {
    if (!date) return "--/--/-- a las --:--";
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} a las ${date.getHours()}:${pad(date.getMinutes())}`;
  };

  return (
    <SafeAreaProvider>
      <View className="flex-1 items-center justify-center bg-white">
        <StatusBar style="auto" />

        {isWell ? (
          <View className="bg-white w-64 h-64 rounded-full items-center justify-center border-2 border-gray-100">
               <Text className="text-2xl font-italic text-center p-4">
                  Vuelve en {timeLeft} segundos
              </Text>
          </View>
        ) : (
          <TouchableOpacity 
            className="bg-green-200 w-64 h-64 rounded-full items-center justify-center shadow-lg active:bg-green-300 transition-all" 
            onPress={handlePress}
          >
            <Text className="text-2xl font-italic text-green-900">Estoy Bien</Text>
          </TouchableOpacity>
        )}

        <View className="mt-8 items-center px-6">
          <Text className="text-lg text-gray-500 font-italic text-center">
            Última vez que dijiste que estabas bien:
          </Text>
          <Text className="text-xl font-bold text-gray-800 mt-2">
              {formatTime(lastConfirmed)}
          </Text>
        </View>
      </View>
    </SafeAreaProvider>
  );
}
