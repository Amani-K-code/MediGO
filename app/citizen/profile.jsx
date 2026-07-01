import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert
} from "react-native";
import { LogOut } from "lucide-react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";

import { auth } from "../../firebase/firebaseConfig";
import useProfile from "../hooks/useProfile";
import ProfileHeader from "../../components/profile/ProfileHeader";
import PersonalInfoCard from "../../components/profile/PersonalInfoCard";
import EmergencyContactCard from "../../components/profile/EmergencyContactCard";
import MedicalTagsCard from "../../components/profile/MedicalTagsCard";
import StandbyStatusCard from "../../components/profile/StandbyStatusCard";

export default function Profile() {
  const router = useRouter();
  const { profile, loading, error, saveField, uploadPhoto, toggleStandby } = useProfile();

  const [banner, setBanner] = useState(null); // { type: "error"|"success", text }
  const bannerTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (bannerTimeoutRef.current) {
        clearTimeout(bannerTimeoutRef.current);
      }
    };
  }, []);

  const showBanner = (type, text) => {
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    setBanner({ type, text });
    bannerTimeoutRef.current = setTimeout(() => {
      setBanner(null);
    }, 3000);
  };

  const handleEditPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showBanner("error", "Photo library permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) return;

    const res = await uploadPhoto(result.assets[0].uri);
    if (!res.ok) {
      showBanner("error", res.message);
    } else {
      showBanner("success", "Profile photo updated.");
    }
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
        <ActivityIndicator size="large" color="#0066FF" />
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

  return (
    <View style={styles.container}>
      {banner && (
        <View
          style={[
            styles.banner,
            banner.type === "error" ? styles.bannerError : styles.bannerSuccess,
          ]}
        >
          <Text
            style={[
              styles.bannerText,
              banner.type === "error" ? styles.bannerTextError : styles.bannerTextSuccess,
            ]}
          >
            {banner.text}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scroller}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader profile={profile} onEditPhoto={handleEditPhoto} />

        <PersonalInfoCard
          profile={profile}
          onSave={saveField}
          onError={(m) => showBanner("error", m)}
        />

        <EmergencyContactCard
          contacts={profile.emergencyContacts}
          onSave={(c) => saveField({ emergencyContacts: c })}
          onError={(m) => showBanner("error", m)}
        />

        <MedicalTagsCard
          conditions={profile.medicalConditions}
          allergies={profile.allergies}
          onSave={saveField}
          onError={(m) => showBanner("error", m)}
        />

        <StandbyStatusCard
          enabled={profile.standbyEnabled}
          onToggle={toggleStandby}
          onError={(m) => showBanner("error", m)}
        />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <LogOut color="#FF3B30" size={18} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4FF",
  },
  scroller: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },
  loaderBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
  },
  errorText: {
    fontSize: 14,
    color: "#C62828",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  banner: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bannerError: {
    backgroundColor: "#FFEAE8",
  },
  bannerSuccess: {
    backgroundColor: "#E3F9E9",
  },
  bannerText: {
    fontSize: 13,
    fontWeight: "500",
  },
  bannerTextError: {
    color: "#C62828",
  },
  bannerTextSuccess: {
    color: "#2DC653",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#FF3B30",
    backgroundColor: "transparent",
    paddingVertical: 14,
    gap: 8,
    marginTop: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
  },
});
