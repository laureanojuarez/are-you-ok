export const Contact = ({ contact }) => {
  return (
    <View style={styles.contactContainer}>
      <Text style={styles.contactName}>{contact.name}</Text>
      <Text style={styles.contactPhone}>{contact.phone}</Text>
    </View>
  );
};
