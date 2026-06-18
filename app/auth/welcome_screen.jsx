import React from "react";
import { 
  View, 
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";

import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";


export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#1565C0", "#1976D2", "#2196F3"]}
      style={styles.gradient}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />
      <SafeAreaView style={styles.safeArea}>

        {/* Logo + Branding */}
        <View style={styles.brandingContainer}>
          <View style={styles.logoWrapper}>
            {/* Map pin with medical cross — inline SVG-style using View */}
            <View style={styles.logoOuter}>
              <View style={styles.logoPin}>
                <View style={styles.crossHorizontal} />
                <View style={styles.crossVertical} />
              </View>
              <View style={styles.logoPinPoint} />
            </View>
          </View>

          <Text style={styles.appName}>MediGo</Text>
          <Text style={styles.tagline}>Emergency care, instantly.</Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/auth/register-citizen")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Sign Up as Citizen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/auth/register-medic")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Sign Up as Healthcare Facility</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  // Branding
  brandingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrapper: {
    marginBottom: 24,
  },
  logoOuter: {
    width: 90,
    height: 110,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logoPin: {
    width: 52,
    height: 52,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
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
  logoPinPoint: {
    width: 14,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 7,
    marginTop: 6,
    transform: [{ rotate: "45deg" }],
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.3,
  },

  // CTA
  ctaContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#1565C0",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  loginPrompt: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  loginLink: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});