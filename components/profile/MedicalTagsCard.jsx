import React, { useState } from "react";
import {
  StyleSheet, Text, TouchableOpacity, View, Modal, FlatList
} from "react-native";
import { Check, Plus, X, ChevronDown } from "lucide-react-native";

// ── Same option lists used in register-citizen.jsx, minus "None" ──
// ("None" doesn't make sense as an addable tag here — it's just the
// registration default before anything is picked.)
const CHRONIC_CONDITIONS = [
  "Hypertension",
  "Diabetes",
  "Chronic Kidney Disease",
  "Coronary Artery Disease",
  "Asthma / COPD",
  "Liver Disease",
  "Thyroid Disorder",
  "Heart Failure",
  "Stroke / TIA History",
  "Epilepsy",
];

const ALLERGIES = [
  "Penicillin",
  "Sulfa Drugs",
  "Latex",
  "NSAIDs (Ibuprofen, Aspirin)",
  "Contrast Dye (Iodine)",
  "Opioids",
  "Local Anesthetics",
  "Egg Protein",
  "Peanuts / Tree Nuts",
  "Chlorhexidine",
];

export default function MedicalTagsCard({ conditions = [], allergies = [], onSave, onError }) {
  const [addingTag, setAddingTag] = useState(false);
  const [newTagType, setNewTagType] = useState("condition"); // "condition" | "allergy"
  const [selectedOption, setSelectedOption] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const optionsForType = newTagType === "condition" ? CHRONIC_CONDITIONS : ALLERGIES;
  const alreadyAdded = newTagType === "condition" ? conditions : allergies;
  const availableOptions = optionsForType.filter((opt) => !alreadyAdded.includes(opt));

  const handleCancelAdd = () => {
    setAddingTag(false);
    setSelectedOption(null);
  };

  const handleSwitchType = (type) => {
    setNewTagType(type);
    setSelectedOption(null);
  };

  const handleConfirmAddTag = async () => {
    if (!selectedOption) return;

    const updatedConditions =
      newTagType === "condition" ? [...conditions, selectedOption] : conditions;
    const updatedAllergies =
      newTagType === "allergy" ? [...allergies, selectedOption] : allergies;

    setSubmitting(true);
    try {
      const res = await onSave({
        medicalConditions: updatedConditions,
        allergies: updatedAllergies,
      });
      if (res.ok) {
        setSelectedOption(null);
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
              onPress={() => handleSwitchType("condition")}
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
              onPress={() => handleSwitchType("allergy")}
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
            <TouchableOpacity
              style={styles.dropdownButton}
              activeOpacity={0.7}
              onPress={() => setPickerVisible(true)}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  !selectedOption && styles.dropdownPlaceholder,
                ]}
                numberOfLines={1}
              >
                {selectedOption || `Select ${newTagType === "condition" ? "a condition" : "an allergy"}`}
              </Text>
              <ChevronDown color="#6B7280" size={16} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmAddButton,
                !selectedOption && styles.confirmAddButtonDisabled,
              ]}
              onPress={handleConfirmAddTag}
              disabled={submitting || !selectedOption}
            >
              <Check color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Dropdown modal — same list-picker pattern as registration */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {newTagType === "condition" ? "Chronic Condition" : "Allergy"}
            </Text>
            <FlatList
              data={availableOptions}
              keyExtractor={(item) => item}
              style={{ maxHeight: 320 }}
              ListEmptyComponent={
                <Text style={styles.emptyOptionsText}>All options already added.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    setSelectedOption(item);
                    setPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === selectedOption && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === selectedOption && (
                    <Check color="#0066FF" size={16} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

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
  dropdownButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0F4FF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: "#0A0F2C",
    flex: 1,
    marginRight: 8,
  },
  dropdownPlaceholder: {
    color: "#6B7280",
  },
  confirmAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0066FF",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmAddButtonDisabled: {
    backgroundColor: "#B7CFFF",
  },
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
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
  // Dropdown modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0A0F2C",
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 4,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  optionText: {
    fontSize: 15,
    color: "#0A0F2C",
  },
  optionTextSelected: {
    color: "#0066FF",
    fontWeight: "700",
  },
  emptyOptionsText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 16,
  },
});