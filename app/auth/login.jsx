import { loginUser } from "../services/authService";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {

  try {

    const userData = await loginUser(email, password);

    if (userData.role === "citizen") {
      router.replace("/citizen/dashboard");

    } else if (userData.role === "medic") {

      if (userData.status === "approved") {
        router.replace("/medic/dashboard");

      } else if (userData.status === "pending") {

        Alert.alert(
          "Pending Approval",
          "Your account is still pending approval. Please wait for an admin to approve your account."
        );

      } else if (userData.status === "rejected") {
        Alert.alert(
          "Account Rejected",
          "Your account has been rejected. Please contact support for more information."
        );

      }

    } else if (userData.role === "admin") {
      router.replace("/admin/dashboard");

    }

} catch (error) {

    Alert.alert(
      "Login Error",
      error.message
    );

  }

};

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* Top gradient header */}
      <LinearGradient
        colors={["#1565C0", "#1976D2", "#42A5F5"]}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Logo */}
          <Image
            source={require("../../assets/images/MediGo_favicon.png")}
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              marginBottom: 16,
              resizeMode: "contain",
            }}
          />

          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Log in to manage your care</Text>
        </SafeAreaView>
      </LinearGradient>

      {/* Form card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <View style={styles.card}>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            </View>

            {/* Password */}
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
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.inputIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Log In  →</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign up link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0F4FF" },
  flex: { flex: 1 },

  // Header
  header: { paddingBottom: 32 },
  headerInner: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  backButton: {
    alignSelf: "flex-start",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  crossHorizontal: {
    position: "absolute",
    width: 28,
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  crossVertical: {
    position: "absolute",
    width: 10,
    height: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 24,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
  },
  tabActive: {},
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#1565C0",
    fontWeight: "700",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: "80%",
    backgroundColor: "#1565C0",
    borderRadius: 2,
  },

  // Inputs
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  inputIcon: {
    marginLeft: 8,
  },

  // Forgot
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    color: "#1565C0",
    fontSize: 13,
    fontWeight: "600",
  },

  // Login button
  loginButton: {
    backgroundColor: "#1565C0",
    height: 56,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: "#9CA3AF",
  },

  // Social
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    gap: 12,
  },
  socialIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
  },
  socialText: {
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },

  // Sign up
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  signupPrompt: {
    color: "#6B7280",
    fontSize: 14,
  },
  signupLink: {
    color: "#1565C0",
    fontSize: 14,
    fontWeight: "700",
  },
});