import React, { useState } from "react";
import {
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import { Check, Plus, X } from "lucide-react-native";

export default function ServicesOfferedCard({ services = [], onSave, onError }) {
  const [addingService, setAddingService] = useState(false);
  const [newServiceText, setNewServiceText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCancelAdd = () => {
    setAddingService(false);
    setNewServiceText("");
  };

  const handleConfirmAdd = async () => {
    const trimmed = newServiceText.trim();
    if (!trimmed) return;

    const updatedServices = [...services, trimmed];

    setSubmitting(true);
    try {
      const res = await onSave({ servicesOffered: updatedServices });
      if (res.ok) {
        setNewServiceText("");
        setAddingService(false);
      } else {
        onError?.(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveService = async (index) => {
    const updatedServices = services.filter((_, i) => i !== index);

    setSubmitting(true);
    try {
      const res = await onSave({ servicesOffered: updatedServices });
      if (!res.ok) {
        onError?.(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Services &amp; Specialties</Text>
        <TouchableOpacity style={styles.addIconButton} onPress={() => setAddingService(true)}>
          <Plus color="#FFFFFF" size={16} />
        </TouchableOpacity>
      </View>

      {addingService && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="e.g. Cardiology"
            placeholderTextColor="#6B7280"
            value={newServiceText}
            onChangeText={setNewServiceText}
          />
          <TouchableOpacity
            style={styles.confirmAddButton}
            onPress={handleConfirmAdd}
            disabled={submitting}
          >
            <Check color="#FFFFFF" size={16} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelAddButton} onPress={handleCancelAdd}>
            <X color="#6B7280" size={16} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.pillsWrap}>
        {services.map((value, index) => (
          <View key={`service-${index}-${value}`} style={styles.servicePill}>
            <Text style={styles.servicePillText}>{value}</Text>
            <TouchableOpacity onPress={() => handleRemoveService(index)}>
              <X color="#0047B3" size={12} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
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
    flex: 1,
    marginRight: 12,
  },
  addIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0066FF",
    alignItems: "center",
    justifyContent: "center",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  addInput: {
    flex: 1,
    backgroundColor: "#F0F4FF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0A0F2C",
  },
  confirmAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0066FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelAddButton: {
    padding: 4,
  },
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  servicePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F0FF",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  servicePillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0047B3",
  },
});
