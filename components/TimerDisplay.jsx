import { StyleSheet, Text, View } from "react-native";

export default function TimerDisplay({ timeLeft }) {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Debes hacer check-in en {hours} h {minutes}m {seconds}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    color: "#222",
  },
});
