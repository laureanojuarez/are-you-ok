import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <MaterialIcons
                    name="people-outline"
                    size={48}
                    color="#9ca3af"
                  />
                </View>
                <Text style={styles.emptyText}>No hay contactos aún</Text>
                <Text style={styles.emptySubtext}>
                  Agrega personas de confianza que serán{"\n"}notificadas en
                  caso de emergencia
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={handleOpenContactPicker}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="contacts" size={20} color="#fff" />
                  <Text style={styles.emptyButtonText}>Elegir contacto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={contacts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.contactItem}>
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactInitial}>
                        {item.name ? item.name.charAt(0).toUpperCase() : "#"}
                      </Text>
                    </View>
                    <View style={styles.contactInfo}>
                      {item.name && (
                        <Text style={styles.contactName}>{item.name}</Text>
                      )}
                      <Text style={styles.contactPhone}>{item.phone}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteContact(item.id)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="close" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>

          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>
                        Selecciona un contacto
                      </Text>
                      <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={styles.modalCloseButton}
                      >
                        <MaterialIcons name="close" size={24} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                    {loadingContacts ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.loadingText}>
                          Cargando contactos...
                        </Text>
                      </View>
                    ) : (
                      <FlatList
                        data={allContacts}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.modalContactItem}
                            onPress={() => handleSelectContact(item)}
                            activeOpacity={0.7}
                          >
                            <View style={styles.modalContactAvatar}>
                              <Text style={styles.modalContactInitial}>
                                {item.name
                                  ? item.name.charAt(0).toUpperCase()
                                  : "#"}
                              </Text>
                            </View>
                            <View style={styles.modalContactInfo}>
                              <Text style={styles.modalContactName}>
                                {item.name}
                              </Text>
                              <Text style={styles.modalContactPhone}>
                                {item.phoneNumbers[0].number}
                              </Text>
                            </View>
                            <MaterialIcons
                              name="add-circle-outline"
                              size={24}
                              color="#3b82f6"
                            />
                          </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                          <View style={styles.emptyModalState}>
                            <MaterialIcons
                              name="contacts"
                              size={40}
                              color="#9ca3af"
                            />
                            <Text style={styles.emptyModalText}>
                              No hay contactos con teléfono
                            </Text>
                          </View>
                        }
                      />
                    )}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
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
  contactItem: {
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
  contactAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  contactInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0284c7",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: "#64748b",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalCloseButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  modalContactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalContactAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  modalContactInitial: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  modalContactInfo: {
    flex: 1,
  },
  modalContactName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: 2,
  },
  modalContactPhone: {
    fontSize: 13,
    color: "#64748b",
  },
  emptyModalState: {
    padding: 40,
    alignItems: "center",
  },
  emptyModalText: {
    marginTop: 12,
    fontSize: 14,
    color: "#94a3b8",
  },
});
