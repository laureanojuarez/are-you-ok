import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

export default function Tab() {
  const [text, setText] = useState("");
  const [contacts, setContacts] = useState([]);

  const handleAddContact = () => {
    if (text.trim() !== "") {
      setContacts([
        ...contacts,
        { id: Date.now().toString(), phone: text.trim() },
      ]);
      setText("");
    }
  };

  const handleDeleteContact = (id) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar style="auto" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Contactos de Emergencia</Text>
            <Text style={styles.subtitle}>
              Agrega los números que recibirán la alerta
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: +54 9 11 1234-5678"
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleAddContact}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddContact}
              activeOpacity={0.7}
            >
              <MaterialIcons name="person-add" color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Contactos ({contacts.length})</Text>
            {contacts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No hay contactos agregados.
                </Text>
                <Text style={styles.emptySubtext}>
                  Agrega al menos un contacto de emergencia
                </Text>
              </View>
            ) : (
              <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactPhone}>{item.phone}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteContact(item.id)}
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="delete" color="#ef4444" size={20} />
                    </TouchableOpacity>
                  </View>
                )}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    height: 50,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: "#22c55e",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  contactPhone: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
  },
});
