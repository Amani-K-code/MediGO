import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { registerCitizen } from "../services/authService";
import * as Location from "expo-location";
import MapView from "react-native-maps";

// ── Dropdown option lists ──
const BLOOD_TYPES = ["None", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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

export default function RegisterCitizen() {
  const router = useRouter();

  // --- Fields that match authService.registerCitizen exactly ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nextOfKin, setNextOfKin] = useState("");
  const [nextOfKinPhone, setNextOfKinPhone] = useState("");
  const [residence, setResidence] = useState("");
  const [password, setPassword] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -1.286389,
    longitude: 36.817223,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // --- New medical info fields (also sent to backend) ---
  const [bloodType, setBloodType] = useState("None");
  const [chronicCondition, setChronicCondition] = useState("None");
  const [allergies, setAllergies] = useState("None");

  // --- UI-only state (not sent to backend) ---
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Step control ---
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  const goNext = () => {
    if (step === 1) {
      if (!fullName || !email || !phone || !residence) {
        Alert.alert("Missing Fields", "Please fill in all personal details.");
        return;
      }
      if (!password || !confirmPassword) {
        Alert.alert("Missing Fields", "Please enter and confirm your password.");
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
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleRegister = async () => {
    if (!userLocation) {
      Alert.alert(
        "Location Required",
        "Please enable location services before registering."
      );
      return;
    }

    setIsLoading(true);
    try {
      await registerCitizen(
        fullName.trim(),
        email.trim(),
        phone.trim(),
        nextOfKin.trim(),
        nextOfKinPhone.trim(),
        residence.trim(),
        userLocation?.latitude || null,
        userLocation?.longitude || null,
        password,
        bloodType,
        chronicCondition,
        allergies
      );
      Alert.alert("Account Created!", "Welcome to MediGo.", [
        { text: "Log In", onPress: () => router.replace("/auth/login") },
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

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Location permission is required to access your current location."
      );
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      setMapRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

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
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => (step === 1 ? router.back() : goBack())}
            >
              <Ionicons name="arrow-back" size={20} color="#1F2937" />
            </TouchableOpacity>

            <View style={styles.logoBox}>
              <Ionicons name="person-add" size={28} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Join as a citizen to access emergency care near you
            </Text>

            {/* Step dots — functional, reflects current step */}
            <View style={styles.dotsRow}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[styles.dot, i <= step && styles.dotActive]}
                />
              ))}
            </View>

            {/* ── STEP 1: Personal Details + Security ── */}
            {step === 1 && (
              <>
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

                <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
                  <Text style={styles.nextBtnText}>Continue →</Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── STEP 2: Emergency Contact + Medical Info ── */}
            {step === 2 && (
              <>
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

                <Text style={styles.sectionLabel}>Medical Info</Text>

                <DropdownField
                  label="Blood Group"
                  icon="water-outline"
                  value={bloodType}
                  options={BLOOD_TYPES}
                  onSelect={setBloodType}
                />
                <DropdownField
                  label="Chronic Condition"
                  icon="medkit-outline"
                  value={chronicCondition}
                  options={CHRONIC_CONDITIONS}
                  onSelect={setChronicCondition}
                />
                <DropdownField
                  label="Allergies"
                  icon="alert-circle-outline"
                  value={allergies}
                  options={ALLERGIES}
                  onSelect={setAllergies}
                />

                <View style={styles.stepBtnRow}>
                  <TouchableOpacity style={styles.backStepBtn} onPress={goBack}>
                    <Text style={styles.backStepBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.nextBtnHalf} onPress={goNext}>
                    <Text style={styles.nextBtnText}>Continue →</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── STEP 3: Location ── */}
            {step === 3 && (
              <>
                <Text style={styles.sectionLabel}>Location</Text>

                <View
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    marginBottom: 20,
                    position: "relative",
                  }}
                >
                  <MapView
                    style={{ height: 250 }}
                    region={mapRegion}
                    onRegionChangeComplete={(region) => setMapRegion(region)}
                  />

                  {/* Fixed Crosshair */}
                  <View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: [{ translateX: -15 }, { translateY: -30 }],
                    }}
                  >
                    <Ionicons name="location" size={30} color="#D62828" />
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#0057B8",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 10,
                  }}
                  onPress={getUserLocation}
                >
                  <Text
                    style={{ color: "#FFFFFF", textAlign: "center", fontWeight: "600" }}
                  >
                    Use My Current Location
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#2A9D8F",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 12,
                  }}
                  onPress={() => {
                    setUserLocation({
                      latitude: mapRegion.latitude,
                      longitude: mapRegion.longitude,
                    });

                    Alert.alert(
                      "Location Saved",
                      `Lat: ${mapRegion.latitude.toFixed(6)}\nLng: ${mapRegion.longitude.toFixed(6)}`
                    );
                  }}
                >
                  <Text
                    style={{ color: "#FFFFFF", textAlign: "center", fontWeight: "600" }}
                  >
                    Confirm Location
                  </Text>
                </TouchableOpacity>

                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 20,
                  }}
                >
                  <Text>
                    Latitude:{" "}
                    {userLocation ? userLocation.latitude.toFixed(6) : "Not selected"}
                  </Text>
                  <Text>
                    Longitude:{" "}
                    {userLocation ? userLocation.longitude.toFixed(6) : "Not selected"}
                  </Text>
                </View>

                <View style={styles.stepBtnRow}>
                  <TouchableOpacity style={styles.backStepBtn} onPress={goBack}>
                    <Text style={styles.backStepBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitBtnHalf, isLoading && styles.submitBtnDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitBtnText}>Create Account →</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
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

// ── Reusable text input ──
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

// ── Simple modal-based dropdown (no extra library needed) ──
function DropdownField({ label, icon, value, options, onSelect }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.inputWrapper}
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.dropdownLabel}>{label}</Text>
          <Text style={styles.dropdownValue}>{value}</Text>
        </View>
        {icon && <Ionicons name={icon} size={18} color="#9CA3AF" />}
        <Ionicons
          name="chevron-down"
          size={16}
          color="#9CA3AF"
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === value && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === value && (
                    <Ionicons name="checkmark" size={18} color="#0057B8" />
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
  root: { flex: 1, backgroundColor: "#F0F2FF" },
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },

  // Header
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

  // Section labels
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0057B8",
    marginBottom: 12,
    marginTop: 8,
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

  // Dropdown field text
  dropdownLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  dropdownValue: {
    fontSize: 15,
    color: "#1F2937",
    marginBottom: 2,
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
    color: "#1F2937",
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
    color: "#1F2937",
  },
  optionTextSelected: {
    color: "#0057B8",
    fontWeight: "700",
  },

  // Step navigation buttons
  nextBtn: {
    backgroundColor: "#0057B8",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 8,
  },
  nextBtnHalf: {
    flex: 1,
    backgroundColor: "#0057B8",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  stepBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  backStepBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0057B8",
  },
  backStepBtnText: {
    color: "#0057B8",
    fontSize: 16,
    fontWeight: "700",
  },

  // Submit
  submitBtnHalf: {
    flex: 1,
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

  // Login footer
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginPrompt: { fontSize: 14, color: "#6B7280" },
  loginLink: { fontSize: 14, fontWeight: "700", color: "#0057B8" },
});