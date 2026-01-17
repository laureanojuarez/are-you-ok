import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ContactItem({ contact, onDelete }) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initial}>
          {contact.name ? contact.name.charAt(0).toUpperCase() : "#"}
        </Text>
      </View>
      <View style={styles.info}>
        {contact.name && <Text style={styles.name}>{contact.name}</Text>}
        <Text style={styles.phone}>{contact.phone}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(contact.id)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="close" size={20} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  initial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0284c7",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: "#64748b",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
});
