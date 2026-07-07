import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, 
} from "react-native";
import { Check, Pencil, X } from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";

const DOB_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const BLOOD_TYPES = [
  "None",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const CHRONIC_CONDITIONS = [
  "None",
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
  "None",
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

export default function PersonalInfoCard({ profile, onSave, onError }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: profile.fullName,
    phone: profile.phone,
    bloodType: profile.bloodType,
    chronicCondition: profile.chronicCondition,
    allergies: profile.allergies,
  });
  const [submitting, setSubmitting] = useState(false);

  // Re-sync form from profile on external updates, but never while the user has an edit in progress
  useEffect(() => {
    if (!editing) {
      setForm({
        fullName: profile.fullName,
        phone: profile.phone,
        bloodType: profile.bloodType,
        chronicCondition: profile.chronicCondition,
        allergies: profile.allergies,
      });
    }
  }, [profile, editing]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setForm({
      fullName: profile.fullName,
      phone: profile.phone,
      bloodType: profile.bloodType,
      chronicCondition: profile.chronicCondition,
      allergies: profile.allergies,
    });
    setEditing(false);
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);

      const res = await onSave({
        fullName: form.fullName,
        phone: form.phone,
        bloodType: form.bloodType,
        chronicCondition: form.chronicCondition,
        allergies: form.allergies,
      });

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
      <View style={styles.titleRow}>
        <Text style={styles.title}>Personal Information</Text>
        {!editing && (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Pencil color="#0066FF" size={16} />
          </TouchableOpacity>
        )}
      </View>

      {editing ? (
        <View>

        <View style={styles.field}>
          <Text style={styles.label}>FULL NAME</Text>
          <TextInput
            style={styles.input}
            value={form.fullName}
            onChangeText={(text) => updateField("fullName", text)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PHONE NUMBER</Text>
          <TextInput
            style={styles.input}
            value={form.phone}
            keyboardType="phone-pad"
            onChangeText={(text) => updateField("phone", text)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>BLOOD TYPE</Text>

          <DropdownField
            value={form.bloodType}
            options={BLOOD_TYPES}
            onSelect={(v) => updateField("bloodType", v)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>CHRONIC CONDITION</Text>

          <DropdownField
            value={form.chronicCondition}
            options={CHRONIC_CONDITIONS}
            onSelect={(v) => updateField("chronicCondition", v)}
          />
        </View>

        <View style={styles.fieldLast}>
          <Text style={styles.label}>ALLERGIES</Text>

          <DropdownField
            value={form.allergies}
            options={ALLERGIES}
            onSelect={(v) => updateField("allergies", v)}
          />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancel}
          >
            <X color="#6B7280" size={18}/>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF"/>
            ) : (
              <Check color="#FFF" size={18}/>
            )}
          </TouchableOpacity>
        </View>

      </View>
      ) : (
        <View>

        <View style={styles.field}>
          <Text style={styles.label}>FULL NAME</Text>
          <Text style={styles.value}>{profile.fullName || "—"}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PHONE NUMBER</Text>
          <Text style={styles.value}>{profile.phone || "—"}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>BLOOD TYPE</Text>
          <Text style={styles.value}>{profile.bloodType || "None"}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>CHRONIC CONDITION</Text>
          <Text style={styles.value}>{profile.chronicCondition || "None"}</Text>
        </View>

        <View style={styles.fieldLast}>
          <Text style={styles.label}>ALLERGIES</Text>
          <Text style={styles.value}>{profile.allergies || "None"}</Text>
        </View>

      </View>
      )}
    </View>
  );
}

function DropdownField({ value, options, onSelect }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.dropdownText}>{value}</Text>

        <Ionicons
          name="chevron-down"
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalCard}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>

                  {item === value && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#0066FF"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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
  titleRow: {
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
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  field: {
    marginBottom: 18,
  },
  fieldLast: {
    marginBottom: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: "400",
    color: "#0A0F2C",
  },
  input: {
    backgroundColor: "#F0F4FF",
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: "#0A0F2C",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F0F4FF",
  },
  saveButton: {
    backgroundColor: "#0066FF",
  },

  dropdown: {
  backgroundColor: "#F0F4FF",
  borderRadius: 14,
  paddingHorizontal: 12,
  paddingVertical: 14,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

dropdownText: {
  fontSize: 14,
  color: "#0A0F2C",
},

modalOverlay: {
  flex: 1,
  justifyContent: "center",
  backgroundColor: "rgba(0,0,0,0.35)",
  paddingHorizontal: 30,
},

modalCard: {
  backgroundColor: "#FFF",
  borderRadius: 18,
  maxHeight: 350,
},

optionRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: "#F1F5F9",
},

optionText: {
  fontSize: 15,
  color: "#0A0F2C",
},
});