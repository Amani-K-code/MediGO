import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import { Check, Pencil, X } from "lucide-react-native";

export default function FacilityInfoCard({ profile, onSave, onError }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: profile.phone,
    email: profile.email,
    location: profile.location,
    operatingHours: profile.operatingHours,
  });
  const [submitting, setSubmitting] = useState(false);

  // Re-sync form from profile on external updates, but never while the user has an edit in progress
  useEffect(() => {
    if (!editing) {
      setForm({
        phone: profile.phone,
        email: profile.email,
        location: profile.location,
        operatingHours: profile.operatingHours,
      });
    }
  }, [profile, editing]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    setForm({
      phone: profile.phone,
      email: profile.email,
      location: profile.location,
      operatingHours: profile.operatingHours,
    });
    setEditing(false);
  };

  const handleSave = async () => {
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
        <Text style={styles.title}>Facility Info</Text>
        {!editing && (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Pencil color="#0066FF" size={16} />
          </TouchableOpacity>
        )}
      </View>

      {editing ? (
        <View>
          <View style={styles.field}>
            <Text style={styles.label}>LICENSE NUMBER</Text>
            <Text style={styles.value}>{profile.licenseNumber || "—"}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>PHONE</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(text) => updateField("phone", text)}
              placeholder="Phone number"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(text) => updateField("email", text)}
              placeholder="Email"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ADDRESS</Text>
            <TextInput
              style={styles.input}
              value={form.location}
              onChangeText={(text) => updateField("location", text)}
              placeholder="Address"
              placeholderTextColor="#6B7280"
            />
          </View>

          <View style={styles.fieldLast}>
            <Text style={styles.label}>OPERATING HOURS</Text>
            <TextInput
              style={styles.input}
              value={form.operatingHours}
              onChangeText={(text) => updateField("operatingHours", text)}
              placeholder="e.g. 24/7 or 8:00 AM - 8:00 PM"
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
            <Text style={styles.label}>LICENSE NUMBER</Text>
            <Text style={styles.value}>{profile.licenseNumber || "—"}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>PHONE</Text>
            <Text style={styles.value}>{profile.phone || "—"}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>EMAIL</Text>
            <Text style={styles.value}>{profile.email || "—"}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ADDRESS</Text>
            <Text style={styles.value}>{profile.location || "—"}</Text>
          </View>

          <View style={styles.fieldLast}>
            <Text style={styles.label}>OPERATING HOURS</Text>
            <Text style={styles.value}>{profile.operatingHours || "—"}</Text>
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
