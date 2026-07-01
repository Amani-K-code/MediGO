import React, { useEffect, useState } from "react";
import {
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import { Check, Phone, Pencil, Plus, Trash2, X } from "lucide-react-native";

// Attach a stable local id to each contact so React has a `key` during a
// single edit session. `_localId` is never persisted to Firestore — it is
// always stripped before calling `onSave`.
const withLocalIds = (arr) =>
  arr.map((c) => ({
    ...c,
    _localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  }));

const getInitials = (name) => {
  if (!name || !name.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function EmergencyContactCard({ contacts, onSave, onError }) {
  const [editing, setEditing] = useState(false);
  const [localContacts, setLocalContacts] = useState(() => withLocalIds(contacts));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editing) {
      setLocalContacts(withLocalIds(contacts));
    }
  }, [contacts, editing]);

  const handleStartAdd = () => {
    setEditing(true);
    setLocalContacts((prev) => [
      ...prev,
      {
        name: "",
        relationship: "",
        phone: "",
        _localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(false);
    setLocalContacts(withLocalIds(contacts));
  };

  const handleRemoveRow = (localId) => {
    setLocalContacts((prev) => prev.filter((c) => c._localId !== localId));
  };

  const handleChangeRow = (localId, field, value) => {
    setLocalContacts((prev) =>
      prev.map((c) => (c._localId === localId ? { ...c, [field]: value } : c))
    );
  };

  const handleSaveContacts = async () => {
    // Drop fully-blank trailing rows left over from an abandoned "+Add" tap.
    const nonBlank = localContacts.filter(
      (c) => c.name.trim() !== "" || c.phone.trim() !== ""
    );

    const allValid = nonBlank.every(
      (c) => c.name.trim() !== "" && c.phone.trim() !== ""
    );

    if (!allValid) {
      onError?.("Each contact needs a name and phone number.");
      return;
    }

    const cleaned = nonBlank.map(({ _localId, ...c }) => c);

    setSubmitting(true);
    try {
      const res = await onSave(cleaned);
      if (res.ok) {
        setEditing(false);
      } else {
        onError?.(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Emergency Contact</Text>
        {!editing && (
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Pencil color="#6B7280" size={18} />
          </TouchableOpacity>
        )}
      </View>

      {!editing ? (
        <>
          {contacts.map((contact, index) => (
            <View key={index} style={styles.contactBlock}>
              <View style={styles.contactRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {!!contact.relationship && (
                    <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                  )}
                </View>
              </View>
              <View style={styles.phoneRow}>
                <Phone color="#6B7280" size={16} />
                <Text style={styles.phoneText}>{contact.phone}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={handleStartAdd}>
            <Plus color="#0047B3" size={16} />
            <Text style={styles.addButtonText}>Add Secondary Contact</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {localContacts.map((contact) => (
            <View key={contact._localId} style={styles.editRow}>
              <View style={styles.editInputs}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#6B7280"
                  value={contact.name}
                  onChangeText={(v) => handleChangeRow(contact._localId, "name", v)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Relationship"
                  placeholderTextColor="#6B7280"
                  value={contact.relationship}
                  onChangeText={(v) => handleChangeRow(contact._localId, "relationship", v)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  placeholderTextColor="#6B7280"
                  keyboardType="phone-pad"
                  value={contact.phone}
                  onChangeText={(v) => handleChangeRow(contact._localId, "phone", v)}
                />
              </View>
              <TouchableOpacity
                style={styles.removeRowButton}
                onPress={() => handleRemoveRow(contact._localId)}
              >
                <Trash2 color="#FF3B30" size={18} />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.editActionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={submitting}
            >
              <X color="#6B7280" size={18} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSaveContacts}
              disabled={submitting}
            >
              <Check color="#FFFFFF" size={18} />
              <Text style={styles.saveButtonText}>{submitting ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "rgba(0,102,255,0.12)",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 1,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A0F2C",
  },
  contactBlock: {
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00C2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A0F2C",
  },
  contactRelationship: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 52,
    gap: 8,
  },
  phoneText: {
    fontSize: 14,
    color: "#0A0F2C",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F0FF",
    borderRadius: 50,
    paddingVertical: 12,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0047B3",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  editInputs: {
    flex: 1,
    gap: 8,
  },
  input: {
    backgroundColor: "#F0F4FF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0A0F2C",
  },
  removeRowButton: {
    padding: 8,
  },
  editActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    paddingVertical: 12,
    gap: 6,
  },
  cancelButton: {
    backgroundColor: "#F0F4FF",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#0066FF",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
