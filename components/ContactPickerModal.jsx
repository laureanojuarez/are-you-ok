import { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ContactPickerModal({
  visible,
  onClose,
  contacts,
  onSelectContact,
  loading,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;

    const query = searchQuery.toLowerCase();
    return contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query),
    );
  }, [contacts, searchQuery]);

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Seleccionar Contacto</Text>
          <TouchableOpacity onPress={handleClose}>
            <MaterialIcons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar contacto..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialIcons name="clear" size={20} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Cargando contactos...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => onSelectContact(item)}
              >
                <View style={styles.contactAvatar}>
                  <MaterialIcons name="person" size={24} color="#64748b" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactPhone}>
                    {item.phoneNumbers[0].number}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No se encontraron contactos
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: "#64748b",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
  },
});
