import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function WellnessButton({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.5}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>Estoy Bien</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
