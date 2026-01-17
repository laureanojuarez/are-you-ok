import { StyleSheet, Text, View } from "react-native";

export default function InfoSection({ label, value, description }) {
  return (
    <View style={styles.container}>
      {description && <Text style={styles.description}>{description}</Text>}
      {label && <Text style={styles.label}>{label}</Text>}
      {value && <Text style={styles.value}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  label: {
    fontSize: 18,
    color: "#6b7280",
    fontStyle: "italic",
    textAlign: "center",
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
    textAlign: "center",
  },
});
