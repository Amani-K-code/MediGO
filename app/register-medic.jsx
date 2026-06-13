import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { registerMedic } from "./services/authService";

// ── Facility type options (UI only — maps to `location` label context) ──
const FACILITY_TYPES = [
  { key: "Hospital", icon: "hospital-box-outline", lib: "mci" },
  { key: "Clinic", icon: "office-building-outline", lib: "mci" },
  { key: "Ambulance", icon: "ambulance", lib: "mci" },
  { key: "Trauma Center", icon: "shield-cross-outline", lib: "mci" },
];

export default function RegisterMedic() {
  const router = useRouter();

  // --- Fields that match authService.registerMedic exactly ---
  const [establishmentName, setEstablishmentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");

  // --- UI-only state (Possible additions to authService.js)---
  const [facilityType, setFacilityType] = useState("Hospital");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [totalAmbulances, setTotalAmbulances] = useState(2); //possible additional feature
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!establishmentName.trim() || !email.trim() || !phone.trim() || !licenseNumber.trim() || !location.trim() || !password) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await registerMedic(
        establishmentName,
        email,
        phone,
        licenseNumber,
        location,
        password
      );
      Alert.alert(
        "Facility Registered!",
        "Your account is pending admin verification. You'll be notified once approved.",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
    } catch (error) {
      const msg =
        error.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : error.message;
      Alert.alert("Registration Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F2FF" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={18} color="#1F2937" />
              <Text style={styles.backLabel}>Back</Text>
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoBox}>
              <Ionicons name="medkit" size={28} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>Register Your Facility</Text>
            <Text style={styles.subtitle}>
              Set up your facility profile to connect with patients
            </Text>

            {/* ── Facility Type Selector ── */}
            <Text style={styles.sectionLabel}>Facility Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.facilityTypeRow}
            >
              {FACILITY_TYPES.map((ft) => {
                // const isActive = facilityType === ft.key;
                return (
                  <TouchableOpacity
                    key={ft.key}
                    // style={[styles.facilityChip, isActive && styles.facilityChipActive]}
                    // onPress={() => setFacilityType(ft.key)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={ft.icon}
                      size={26}
                      // color={isActive ? "#FFFFFF" : "#6B7280"}
                    />
                    <Text
                      style={[
                        styles.facilityChipLabel,
                        // isActive && styles.facilityChipLabelActive,
                      ]}
                    >
                      {ft.key}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* ── Facility Details ── */}
            <InputField
              placeholder="Facility Name"
              value={establishmentName}
              onChangeText={setEstablishmentName}
              autoCapitalize="words"
            />

            {/* Email + Phone side by side */}
            <View style={styles.row}>
              <View style={[styles.inputWrapper, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={[styles.inputWrapper, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* License Number + County side by side */}
            <View style={styles.row}>
              <View style={[styles.inputWrapper, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="License Number"
                  placeholderTextColor="#9CA3AF"
                  value={licenseNumber}
                  onChangeText={setLicenseNumber}
                  autoCapitalize="characters"
                />
              </View>
              <View style={[styles.inputWrapper, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="County / Location"
                  placeholderTextColor="#9CA3AF"
                  value={location}
                  onChangeText={setLocation}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Total Ambulances stepper */}
            <View style={styles.stepperCard}>
              <Text style={styles.stepperLabel}>Total Ambulances</Text>
              <View style={styles.stepperControls}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTotalAmbulances(Math.max(0, totalAmbulances - 1))}
                >
                  <Ionicons name="remove" size={20} color="#0057B8" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{totalAmbulances}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTotalAmbulances(totalAmbulances + 1)}
                >
                  <Ionicons name="add" size={20} color="#0057B8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Password ── */}
            <View style={styles.row}>
              <View style={[styles.inputWrapper, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputWrapper, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons
                    name={showConfirm ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Verification Notice ── */}
            <View style={styles.verifyBanner}>
              <MaterialCommunityIcons
                name="timer-sand"
                size={24}
                color="#D97706"
              />
              <View style={styles.verifyText}>
                <Text style={styles.verifyTitle}>Verification Required</Text>
                <Text style={styles.verifyDesc}>
                  Your account will be reviewed by our medical board before you
                  can accept emergency requests.
                </Text>
              </View>
            </View>

            {/* ── Submit ── */}
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Register Facility  →</Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Reusable input within this file ──
function InputField({
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  autoCapitalize = "none",
}) {
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0F2FF" },
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },

  // Back
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  backLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },

  // Logo
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0057B8",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 16,
  },

  // Section
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
  },

  // Facility type chips
  facilityTypeRow: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 4,
    marginBottom: 20,
  },
  facilityChip: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  facilityChipActive: {
    backgroundColor: "#0057B8",
    borderColor: "#0057B8",
  },
  facilityChipLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  facilityChipLabelActive: {
    color: "#FFFFFF",
  },

  // Inputs
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    height: 55,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },

  // Row layout
  row: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },

  // Ambulance stepper
  stepperCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 12,
  },
  stepperLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    minWidth: 24,
    textAlign: "center",
  },

  // Verification banner
  verifyBanner: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  verifyText: { flex: 1 },
  verifyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D97706",
    marginBottom: 4,
  },
  verifyDesc: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },

  // Submit
  submitBtn: {
    backgroundColor: "#0057B8",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0057B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});