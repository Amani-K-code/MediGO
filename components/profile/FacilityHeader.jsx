import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, ShieldCheck, User } from "lucide-react-native";

// Assumption: `profile` is always loaded/non-null by the time this component renders —
// the parent screen should only mount it after fetching profile data.
export default function FacilityHeader({ profile, onEditPhoto }) {
  const isPending = profile.status === "pending";
  const isAmbulance = profile.providerType === "ambulance";

  return (
    <LinearGradient
      colors={["#0066FF", "#00C2FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <TouchableOpacity style={styles.avatarWrapper} onPress={onEditPhoto} activeOpacity={0.85}>
        {profile.profilePhotoUrl ? (
          <Image source={{ uri: profile.profilePhotoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <User color="#0066FF" size={40} />
          </View>
        )}
        <View style={styles.cameraBadge}>
          <Camera color="#0066FF" size={14} />
        </View>
      </TouchableOpacity>

      <Text style={styles.name}>{profile.establishmentName}</Text>
      <Text style={styles.location}>{profile.location}</Text>

      <View style={[styles.statusPill, isPending && styles.statusPillPending]}>
        <ShieldCheck color={isPending ? "#D97706" : "#FFFFFF"} size={14} />
        <Text style={[styles.statusText, isPending && styles.statusTextPending]}>
          {isPending
            ? "Pending Verification"
            : isAmbulance
            ? "Ambulance Service"
            : "Healthcare Facility"}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "rgba(0,102,255,0.12)",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 1,
    elevation: 4,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    backgroundColor: "#E8F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 6,
  },
  statusPillPending: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  statusTextPending: {
    color: "#D97706",
  },
});
