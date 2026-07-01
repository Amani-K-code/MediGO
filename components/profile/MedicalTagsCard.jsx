import React, { useState } from "react";
import {
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import { Check, Plus, X } from "lucide-react-native";

export default function MedicalTagsCard({ conditions, allergies, onSave, onError }) {
  const [addingTag, setAddingTag] = useState(false);
  const [newTagText, setNewTagText] = useState("");
  const [newTagType, setNewTagType] = useState("condition"); // "condition" | "allergy"
  const [submitting, setSubmitting] = useState(false);

  const handleCancelAdd = () => {
    setAddingTag(false);
    setNewTagText("");
  };

  const handleConfirmAddTag = async () => {
    const trimmed = newTagText.trim();
    if (!trimmed) return;

    const updatedConditions =
      newTagType === "condition" ? [...conditions, trimmed] : conditions;
    const updatedAllergies =
      newTagType === "allergy" ? [...allergies, trimmed] : allergies;

    setSubmitting(true);
    try {
      const res = await onSave({
        medicalConditions: updatedConditions,
        allergies: updatedAllergies,
      });
      if (res.ok) {
        setNewTagText("");
        setAddingTag(false);
      } else {
        onError?.(res.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveTag = async (type, index) => {
    const updatedConditions =
      type === "condition" ? conditions.filter((_, i) => i !== index) : conditions;
    const updatedAllergies =
      type === "allergy" ? allergies.filter((_, i) => i !== index) : allergies;

    setSubmitting(true);
    try {
      const res = await onSave({
        medicalConditions: updatedConditions,
        allergies: updatedAllergies,
      });
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
        <Text style={styles.title}>Medical Conditions &amp; Allergies</Text>
        <TouchableOpacity style={styles.addIconButton} onPress={() => setAddingTag(true)}>
          <Plus color="#FFFFFF" size={16} />
        </TouchableOpacity>
      </View>

      {addingTag && (
        <View style={styles.addTagRow}>
          <View style={styles.typeChipsRow}>
            <TouchableOpacity
              style={[
                styles.typeChip,
                newTagType === "condition" ? styles.typeChipActive : styles.typeChipInactive,
              ]}
              onPress={() => setNewTagType("condition")}
            >
              <Text
                style={[
                  styles.typeChipText,
                  newTagType === "condition"
                    ? styles.typeChipTextActive
                    : styles.typeChipTextInactive,
                ]}
              >
                Condition
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeChip,
                newTagType === "allergy" ? styles.typeChipActive : styles.typeChipInactive,
              ]}
              onPress={() => setNewTagType("allergy")}
            >
              <Text
                style={[
                  styles.typeChipText,
                  newTagType === "allergy"
                    ? styles.typeChipTextActive
                    : styles.typeChipTextInactive,
                ]}
              >
                Allergy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelAddButton} onPress={handleCancelAdd}>
              <X color="#6B7280" size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.addInputRow}>
            <TextInput
              style={styles.addInput}
              placeholder="e.g. Asthma"
              placeholderTextColor="#6B7280"
              value={newTagText}
              onChangeText={setNewTagText}
            />
            <TouchableOpacity
              style={styles.confirmAddButton}
              onPress={handleConfirmAddTag}
              disabled={submitting}
            >
              <Check color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.pillsWrap}>
        {conditions.map((value, index) => (
          <View key={`condition-${index}-${value}`} style={styles.conditionPill}>
            <Text style={styles.conditionPillText}>{value}</Text>
            <TouchableOpacity onPress={() => handleRemoveTag("condition", index)}>
              <X color="#0047B3" size={12} />
            </TouchableOpacity>
          </View>
        ))}
        {allergies.map((value, index) => (
          <View key={`allergy-${index}-${value}`} style={styles.allergyPill}>
            <Text style={styles.allergyPillText}>{value}</Text>
            <TouchableOpacity onPress={() => handleRemoveTag("allergy", index)}>
              <X color="#C62828" size={12} />
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
  addTagRow: {
    marginBottom: 16,
    gap: 8,
  },
  typeChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeChip: {
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeChipActive: {
    backgroundColor: "#0066FF",
  },
  typeChipInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0066FF",
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  typeChipTextActive: {
    color: "#FFFFFF",
  },
  typeChipTextInactive: {
    color: "#0066FF",
  },
  cancelAddButton: {
    marginLeft: "auto",
    padding: 4,
  },
  addInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  // Design.md does not define an "Emergency Light" tint; derived here as
  // the same relationship Primary Light (#E8F0FF) has to Primary (#0066FF).
  conditionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F0FF",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  conditionPillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0047B3",
  },
  allergyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEAE8",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  allergyPillText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#C62828",
  },
});
