import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import { Check, Pencil, X } from "lucide-react-native";

const DOB_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function PersonalInfoCard({ profile, onSave, onError }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile.name,
    location: profile.location,
    dateOfBirth: profile.dateOfBirth,
    bloodType: profile.bloodType,
    primaryPhysician: profile.primaryPhysician,
  });
  const [submitting, setSubmitting] = useState(false);

  // Re-sync form from profile on external updates, but never while the user has an edit in progress
  useEffect(() => {
    if (!editing) {
      setForm({
        name: profile.name,
        location: profile.location,
        dateOfBirth: profile.dateOfBirth,
        bloodType: profile.bloodType,
        primaryPhysician: profile.primaryPhysician,
      });
    }
  }, [profile, editing]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setForm({
      name: profile.name,
      location: profile.location,
      dateOfBirth: profile.dateOfBirth,
      bloodType: profile.bloodType,
      primaryPhysician: profile.primaryPhysician,
    });
    setEditing(false);
  };

  const handleSave = async () => {
    if (form.dateOfBirth && !DOB_REGEX.test(form.dateOfBirth)) {
      onError?.("Date of birth must be in YYYY-MM-DD format.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await onSave(form);
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
        <Text style={styles.title}>Personal Info</Text>
        {!editing && (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Pencil color="#0066FF" size={16} />
          </TouchableOpacity>
        )}
      </View>

      {editing ? (
        <View>
          {/* Name and location are edited here even though they're displayed in the screen header, not in this card */}
          <View style={styles.field}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => updateField("name", text)}
              placeholder="Full name"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>LOCATION</Text>
            <TextInput
              style={styles.input}
              value={form.location}
              onChangeText={(text) => updateField("location", text)}
              placeholder="Location"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>DATE OF BIRTH</Text>
            <TextInput
              style={styles.input}
              value={form.dateOfBirth}
              onChangeText={(text) => updateField("dateOfBirth", text)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>BLOOD TYPE</Text>
            <TextInput
              style={styles.input}
              value={form.bloodType}
              onChangeText={(text) => updateField("bloodType", text)}
              placeholder="e.g. O Positive (O+)"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.fieldLast}>
            <Text style={styles.label}>PRIMARY PHYSICIAN</Text>
            <TextInput
              style={styles.input}
              value={form.primaryPhysician}
              onChangeText={(text) => updateField("primaryPhysician", text)}
              placeholder="Dr. name, hospital"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={submitting}
            >
              <X color="#6B7280" size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Check color="#FFFFFF" size={18} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <View style={styles.field}>
            <Text style={styles.label}>DATE OF BIRTH</Text>
            <Text style={styles.value}>{profile.dateOfBirth || "—"}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>BLOOD TYPE</Text>
            <Text style={styles.value}>{profile.bloodType || "—"}</Text>
          </View>

          <View style={styles.fieldLast}>
            <Text style={styles.label}>PRIMARY PHYSICIAN</Text>
            <Text style={styles.value}>{profile.primaryPhysician || "—"}</Text>
          </View>
        </View>
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
});
