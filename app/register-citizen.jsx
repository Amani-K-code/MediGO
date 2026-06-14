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
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { registerCitizen } from "./services/authService";

export default function RegisterCitizen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // --- Fields ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [residence, setResidence] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nextOfKin, setNextOfKin] = useState("");
  const [nextOfKinPhone, setNextOfKinPhone] = useState("");
  const [isStandbyPatient, setIsStandbyPatient] = useState(false);
  const [chronicConditions, setChronicConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateStep1 = () => {
    if (!fullName || !email || !phone || !residence) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!password) {
      Alert.alert("Missing Fields", "Please enter a password.");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await registerCitizen(
        fullName.trim(),
        email.trim(),
        phone.trim(),
        nextOfKin.trim(),
        nextOfKinPhone.trim(),
        residence.trim(),
        password
      );
      Alert.alert("Account Created!", "Welcome to MediGo.", [
        { text: "Log In", onPress: () => router.replace("/login") },
      ]);
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

  const stepTitles = ["Personal Details", "Security", "Emergency & Medical"];
  const stepSubtitles = [
    "Tell us who you are",
    "Secure your account",
    "Help us keep you safe",
  ];

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
            {/* Header */}
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color="#1F2937" />
            </TouchableOpacity>

            <View style={styles.logoBox}>
              <Ionicons name="person-add" size={28} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>{stepTitles[step - 1]}</Text>
            <Text style={styles.subtitle}>{stepSubtitles[step - 1]}</Text>

            {/* Step dots */}
            <View style={styles.dotsRow}>
              {[1, 2, 3].map((s) => (
                <View
                  key={s}
                  style={[styles.dot, step === s && styles.dotActive, step > s && styles.dotDone]}
                />
              ))}
            </View>

            {/* ── Step 1: Personal Details ── */}
            {step === 1 && (
              <View>
                <Text style={styles.sectionLabel}>Personal Details</Text>
                <InputField
                  placeholder="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  icon="person-outline"
                  autoCapitalize="words"
                />
                <InputField
                  placeholder="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <InputField
                  placeholder="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  icon="call-outline"
                  keyboardType="phone-pad"
                />
                <InputField
                  placeholder="Residence / Area"
                  value={residence}
                  onChangeText={setResidence}
                  icon="location-outline"
                />
              </View>
            )}

            {/* ── Step 2: Security ── */}
            {step === 2 && (
              <View>
                <Text style={styles.sectionLabel}>Security</Text>
                <View style={styles.inputWrapper}>
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
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
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
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── Step 3: Emergency & Medical ── */}
            {step === 3 && (
              <View>
                <Text style={styles.sectionLabel}>Emergency Contact</Text>
                <InputField
                  placeholder="Contact Name"
                  value={nextOfKin}
                  onChangeText={setNextOfKin}
                  icon="people-outline"
                  autoCapitalize="words"
                />
                <InputField
                  placeholder="Contact Phone"
                  value={nextOfKinPhone}
                  onChangeText={setNextOfKinPhone}
                  icon="call-outline"
                  keyboardType="phone-pad"
                />

                {/* Medical Information */}
                <Text style={styles.sectionLabel}>Medical Information</Text>
                <Text style={styles.medicalHint}>
                  Optional — shared with emergency responders only.
                </Text>

                <Text style={styles.fieldLabel}>Chronic Conditions</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g. Diabetes Type 2, Hypertension, Asthma…"
                    placeholderTextColor="#9CA3AF"
                    value={chronicConditions}
                    onChangeText={setChronicConditions}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <Text style={styles.fieldLabel}>Allergies</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g. Penicillin, Peanuts, Latex…"
                    placeholderTextColor="#9CA3AF"
                    value={allergies}
                    onChangeText={setAllergies}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                {/* Standby Patient Card — sits at the bottom as a toggle summary */}
                <View style={styles.standbyCard}>
                  <View style={styles.standbyIconBox}>
                    <Ionicons name="medkit-outline" size={22} color="#0057B8" />
                  </View>
                  <View style={styles.standbyText}>
                    <Text style={styles.standbyTitle}>Standby Patient</Text>
                    <Text style={styles.standbyDesc}>
                      Mark yourself as a standby patient so emergency responders
                      can access your medical profile instantly.
                    </Text>
                    <View style={styles.standbyToggleRow}>
                      <Text style={styles.standbyToggleLabel}>
                        Register as standby patient
                      </Text>
                      <Switch
                        value={isStandbyPatient}
                        onValueChange={setIsStandbyPatient}
                        trackColor={{ false: "#D1D5DB", true: "#0057B8" }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* ── Navigation ── */}
            {step < 3 ? (
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>Continue  →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Account  →</Text>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function InputField({
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType = "default",
  autoCapitalize = "none",
  secureTextEntry = false,
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
        secureTextEntry={secureTextEntry}
      />
      {icon && <Ionicons name={icon} size={18} color="#9CA3AF" />}
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

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
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
    marginBottom: 20,
    paddingHorizontal: 16,
  },

  // Step dots
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    width: 40,
    backgroundColor: "#0057B8",
  },
  dotDone: {
    backgroundColor: "#93C5FD",
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0057B8",
    marginBottom: 12,
    marginTop: 8,
  },

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
  textAreaWrapper: {
    height: "auto",
    minHeight: 90,
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 66,
  },

  standbyCard: {
    flexDirection: "row",
    backgroundColor: "#EEF3FF",
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  standbyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  standbyText: { flex: 1 },
  standbyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  standbyDesc: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 12,
  },
  standbyToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  standbyToggleLabel: {
    fontSize: 13,
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },

  medicalSection: {
    marginBottom: 8,
  },
  medicalHint: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 16,
    marginTop: -6,
    fontStyle: "italic",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginLeft: 4,
  },

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
    marginBottom: 20,
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginPrompt: { fontSize: 14, color: "#6B7280" },
  loginLink: { fontSize: 14, fontWeight: "700", color: "#0057B8" },
});