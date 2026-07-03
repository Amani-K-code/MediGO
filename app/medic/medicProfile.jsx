import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput
} from "react-native";
import { LogOut, Pencil, Check, X, ShieldCheck, MapPin, Phone, FileText, Building2, Info } from "lucide-react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { auth } from "../../firebase/firebaseConfig";
import useMedicProfile from "../hooks/useMedicProfile";

// ── Facility Header Card ──────────────────────────────────────────────────────
function FacilityHeader({ profile }) {
  const getStatusColor = () => {
    if (profile.status === "approved") return "#16A34A";
    if (profile.status === "rejected") return "#C62828";
    return "#D97706";
  };

  const getStatusLabel = () => {
    if (profile.status === "approved") return "Verified Facility";
    if (profile.status === "rejected") return "Rejected";
    return "Pending Verification";
  };

  return (
    <LinearGradient
      colors={["#0057B8", "#00C2FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerCard}
    >
      <View style={styles.headerIconCircle}>
        <Building2 color="#0057B8" size={40} />
      </View>

      <Text style={styles.headerName}>{profile.establishmentName || "—"}</Text>
      <Text style={styles.headerSub}>{profile.providerType || "Healthcare Facility"}</Text>

      <View style={[styles.statusPill, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
        <ShieldCheck color="#FFFFFF" size={14} />
        <Text style={[styles.statusPillText, { color: getStatusColor() === "#16A34A" ? "#DCFCE7" : "#FEE2E2" }]}>
          {getStatusLabel()}
        </Text>
      </View>
    </LinearGradient>
  );
}

// ── Facility Info Card ────────────────────────────────────────────────────────
function FacilityInfoCard({ profile, onSave, onError }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    establishmentName: profile.establishmentName,
    phone: profile.phone,
    location: profile.location,
    providerType: profile.providerType,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editing) {
      setForm({
        establishmentName: profile.establishmentName,
        phone: profile.phone,
        location: profile.location,
        providerType: profile.providerType,
      });
    }
  }, [profile, editing]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
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

  const handleCancel = () => {
    setForm({
      establishmentName: profile.establishmentName,
      phone: profile.phone,
      location: profile.location,
      providerType: profile.providerType,
    });
    setEditing(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardTitleRow}>
        <Text style={styles.cardTitle}>Facility Details</Text>
        {!editing && (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Pencil color="#0057B8" size={16} />
          </TouchableOpacity>
        )}
      </View>

      {editing ? (
        <View>
          <Field label="Establishment Name">
            <TextInput
              style={styles.input}
              value={form.establishmentName}
              onChangeText={(v) => setForm((p) => ({ ...p, establishmentName: v }))}
              placeholder="Facility name"
              placeholderTextColor="#6B7280"
            />
          </Field>
          <Field label="Phone Number">
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
              placeholder="e.g. 0712345678"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
          </Field>
          <Field label="County / Location">
            <TextInput
              style={styles.input}
              value={form.location}
              onChangeText={(v) => setForm((p) => ({ ...p, location: v }))}
              placeholder="e.g. Nairobi"
              placeholderTextColor="#6B7280"
            />
          </Field>
          <Field label="Provider Type">
            <TextInput
              style={styles.input}
              value={form.providerType}
              onChangeText={(v) => setForm((p) => ({ ...p, providerType: v }))}
              placeholder="e.g. Hospital, Clinic"
              placeholderTextColor="#6B7280"
            />
          </Field>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={handleCancel}
              disabled={submitting}
            >
              <X color="#6B7280" size={18} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.saveBtn]}
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
          <InfoRow icon={<Building2 color="#6B7280" size={16} />} label="ESTABLISHMENT" value={profile.establishmentName} />
          <InfoRow icon={<Phone color="#6B7280" size={16} />} label="PHONE" value={profile.phone} />
          <InfoRow icon={<MapPin color="#6B7280" size={16} />} label="LOCATION" value={profile.location} />
          <InfoRow icon={<Info color="#6B7280" size={16} />} label="PROVIDER TYPE" value={profile.providerType} last />
        </View>
      )}
    </View>
  );
}

// ── License Card ──────────────────────────────────────────────────────────────
function LicenseCard({ profile }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>License & Credentials</Text>

      <View style={styles.licenseBox}>
        <View style={styles.licenseIconBox}>
          <FileText color="#0057B8" size={22} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.licenseLabel}>LICENSE NUMBER</Text>
          <Text style={styles.licenseValue}>{profile.licenseNumber || "—"}</Text>
        </View>
        <View style={[styles.licenseStatusDot, {
          backgroundColor: profile.status === "approved" ? "#DCFCE7" : "#FEF3C7"
        }]}>
          <Text style={[styles.licenseStatusText, {
            color: profile.status === "approved" ? "#16A34A" : "#D97706"
          }]}>
            {profile.status === "approved" ? "Active" : "Pending"}
          </Text>
        </View>
      </View>

      <View style={styles.infoNote}>
        <Text style={styles.infoNoteText}>
          License credentials are verified by the MediGo medical board and cannot be edited directly. Contact support for amendments.
        </Text>
      </View>
    </View>
  );
}

// ── Coordinates Card ──────────────────────────────────────────────────────────
function LocationCard({ profile }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Registered Coordinates</Text>
      <View style={styles.coordRow}>
        <View style={styles.coordBox}>
          <Text style={styles.coordLabel}>LATITUDE</Text>
          <Text style={styles.coordValue}>
            {profile.latitude != null ? Number(profile.latitude).toFixed(6) : "—"}
          </Text>
        </View>
        <View style={styles.coordDivider} />
        <View style={styles.coordBox}>
          <Text style={styles.coordLabel}>LONGITUDE</Text>
          <Text style={styles.coordValue}>
            {profile.longitude != null ? Number(profile.longitude).toFixed(6) : "—"}
          </Text>
        </View>
      </View>
      <View style={styles.infoNote}>
        <Text style={styles.infoNoteText}>
          Location coordinates are set during registration. Re-register to update the facilit position on the map.
        </Text>
      </View>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function InfoRow({ icon, label, value, last = false }) {
  return (
    <View style={[styles.infoRow, last && { marginBottom: 0 }]}>
      <View style={styles.infoRowIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoRowLabel}>{label}</Text>
        <Text style={styles.infoRowValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MedicProfile() {
  const router = useRouter();
  const { profile, loading, error, saveField } = useMedicProfile();

  const [banner, setBanner] = useState(null);
  const bannerTimeoutRef = useRef(null);

  useEffect(() => {
    return () => { if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current); };
  }, []);

  const showBanner = (type, text) => {
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    setBanner({ type, text });
    bannerTimeoutRef.current = setTimeout(() => setBanner(null), 3000);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/login");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#0057B8" />
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={styles.loaderBox}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#0057B8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {banner && (
        <View style={[styles.banner, banner.type === "error" ? styles.bannerError : styles.bannerSuccess]}>
          <Text style={[styles.bannerText, banner.type === "error" ? styles.bannerTextError : styles.bannerTextSuccess]}>
            {banner.text}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FacilityHeader profile={profile} />

        <FacilityInfoCard
          profile={profile}
          onSave={saveField}
          onError={(m) => showBanner("error", m)}
        />

        <LicenseCard profile={profile} />

        <LocationCard profile={profile} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <LogOut color="#FF3B30" size={18} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4FF" },
  scroller: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 140, gap: 16 },
  loaderBox: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F0F4FF" },
  errorText: { fontSize: 14, color: "#C62828", textAlign: "center", paddingHorizontal: 40 },

  // Banner
  banner: { marginHorizontal: 20, marginTop: 12, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14 },
  bannerError: { backgroundColor: "#FFEAE8" },
  bannerSuccess: { backgroundColor: "#E3F9E9" },
  bannerText: { fontSize: 13, fontWeight: "500" },
  bannerTextError: { color: "#C62828" },
  bannerTextSuccess: { color: "#2DC653" },

  // Header card
  headerCard: { borderRadius: 20, padding: 24, alignItems: "center", shadowColor: "rgba(0,87,184,0.15)", shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 1, elevation: 4 },
  headerIconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#E6F4FE", justifyContent: "center", alignItems: "center", marginBottom: 12, borderWidth: 3, borderColor: "#FFFFFF" },
  headerName: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginBottom: 2 },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 12, textTransform: "capitalize" },
  statusPill: { flexDirection: "row", alignItems: "center", borderRadius: 50, paddingVertical: 6, paddingHorizontal: 14, gap: 6 },
  statusPillText: { fontSize: 12, fontWeight: "600" },

  // Card base
  card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, shadowColor: "rgba(0,102,255,0.12)", shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 1, elevation: 4 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#0A0F2C", marginBottom: 16 },
  editBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#E6F4FE", alignItems: "center", justifyContent: "center" },

  // Info rows
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  infoRowIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F0F4FF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  infoRowLabel: { fontSize: 10, fontWeight: "600", color: "#6B7280", textTransform: "uppercase", marginBottom: 2 },
  infoRowValue: { fontSize: 14, fontWeight: "500", color: "#0A0F2C" },

  // Field (editing)
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: "600", color: "#6B7280", textTransform: "uppercase", marginBottom: 6 },
  input: { backgroundColor: "#F0F4FF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#0A0F2C" },
  actionsRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 4, gap: 12 },
  actionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  cancelBtn: { backgroundColor: "#F0F4FF" },
  saveBtn: { backgroundColor: "#0057B8" },

  // License card
  licenseBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0F4FF", borderRadius: 16, padding: 14, gap: 12, marginBottom: 12 },
  licenseIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#E6F4FE", justifyContent: "center", alignItems: "center" },
  licenseLabel: { fontSize: 10, fontWeight: "600", color: "#6B7280", textTransform: "uppercase", marginBottom: 4 },
  licenseValue: { fontSize: 16, fontWeight: "800", color: "#0A0F2C" },
  licenseStatusDot: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  licenseStatusText: { fontSize: 11, fontWeight: "700" },

  // Coordinates card
  coordRow: { flexDirection: "row", backgroundColor: "#F0F4FF", borderRadius: 16, padding: 16, marginBottom: 12 },
  coordBox: { flex: 1, alignItems: "center" },
  coordDivider: { width: 1, backgroundColor: "#E2E8F0", marginHorizontal: 8 },
  coordLabel: { fontSize: 10, fontWeight: "600", color: "#6B7280", textTransform: "uppercase", marginBottom: 6 },
  coordValue: { fontSize: 14, fontWeight: "700", color: "#0A0F2C" },

  // Info note
  infoNote: { backgroundColor: "#EEF3FF", borderRadius: 12, padding: 12 },
  infoNoteText: { fontSize: 12, color: "#64748B", lineHeight: 17 },

  // Logout
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 50, borderWidth: 1.5, borderColor: "#FF3B30", backgroundColor: "transparent", paddingVertical: 14, gap: 8 },
  logoutText: { fontSize: 14, fontWeight: "600", color: "#FF3B30" },
});