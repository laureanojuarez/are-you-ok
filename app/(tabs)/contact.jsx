import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ContactItem from "../../components/ContactItem";
import EmptyContactsState from "../../components/EmptyContactsState";
import ContactPickerModal from "../../components/ContactPickerModal";

export default function Tab() {
  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    saveContacts();
  }, [contacts]);

  const loadContacts = async () => {
    try {
      const saved = await AsyncStorage.getItem("emergencyContacts");
      if (saved) {
        setContacts(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const saveContacts = async () => {
    try {
      await AsyncStorage.setItem("emergencyContacts", JSON.stringify(contacts));
    } catch (error) {
      console.error("Error saving contacts:", error);
    }
  };

  const handleDeleteContact = (id) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleOpenContactPicker = async () => {
    setLoadingContacts(true);
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se pudo acceder a los contactos.");
      setLoadingContacts(false);
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });
    setAllContacts(
      data.filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0),
    );
    setLoadingContacts(false);
    setModalVisible(true);
  };

  const handleSelectContact = (contact) => {
    const phone = contact.phoneNumbers[0].number;
    if (!contacts.some((c) => c.phone === phone)) {
      setContacts([...contacts, { id: contact.id, phone, name: contact.name }]);
    } else {
      Alert.alert("Duplicado", "Este contacto ya está en tu lista");
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <StatusBar style="auto" />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Contactos de Emergencia</Text>
            <Text style={styles.subtitle}>
              Personas que recibirán tu alerta de seguridad
            </Text>
          </View>

          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                {contacts.length === 0
                  ? "Sin contactos"
                  : `${contacts.length} contacto${contacts.length > 1 ? "s" : ""}`}
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleOpenContactPicker}
                activeOpacity={0.8}
              >
                <MaterialIcons name="person-add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>

            {contacts.length === 0 ? (
              <EmptyContactsState onAddContact={handleOpenContactPicker} />
            ) : (
              <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <ContactItem contact={item} onDelete={handleDeleteContact} />
                )}
              />
            )}
          </View>

          <ContactPickerModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            contacts={allContacts}
            onSelectContact={handleSelectContact}
            loading={loadingContacts}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 20,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
});
