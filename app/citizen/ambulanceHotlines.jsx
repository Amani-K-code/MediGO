import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Clipboard, Alert } from "react-native";
import { Ambulance, Phone, MapPin } from "lucide-react-native";
import { fetchActiveAmbulances } from "../services/ambulanceService";
import { triggerSMSFallback } from "../services/smsService";
import {MessageSquare} from "lucide-react-native";

export default function AmbulanceHotlines() {
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFleetData = async () => {
            const result = await fetchActiveAmbulances();
            if (result.success) {
                setAmbulances(result.data);
            } setLoading(false);

        };
        loadFleetData();
    }, []);

    const handleDialCall = async (phoneNumber) => {
        if (!phoneNumber || phoneNumber === "No number provided") {
            Alert.alert("Unavailable", "No contact number was provided for this emergency response unit.");
            return;
        }
        
        const cleanedPhone = phoneNumber.replace(/[^0-9+]/g, "");
        const phoneUrl = `tel:${cleanedPhone}`;

        try {
            const isSupported = await Linking.canOpenURL(phoneUrl);

            if (isSupported) {
                await Linking.openURL(phoneUrl);
            } else {
                // Fallback for any device that lack OS hardware hooks --- copy to clipboard and alert user
                Clipboard.setString(phoneNumber);
                Alert.alert(
                    "Number Copied",
                    `${phoneNumber} has been copied to your clipboard.`
                );
            }
        } catch (error) {
            console.error("Error trying to copy Phone Number: ", error);
            // Bulletproof fallback
            Clipboard.setString(phoneNumber);
            Alert.alert("Number Copied", "Copied emergency number to clipboard.");
        }
    };

    if (loading) {
        return (
            <View style={styles.centerWrap}>
        <View style={styles.loadingGlassCard}>
          <ActivityIndicator size="large" color="#0057B8" />
          <Text style={styles.loadingText}>Locating nearest fleet vehicles...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floating glass header — matches home page MediGo pill */}
      <View style={styles.floatingHeader}>
        <View style={styles.glassPill}>
          <View style={styles.glassPillLeft}>
            <View style={styles.glassIconDot}>
              <Ambulance color="#0057B8" size={16} strokeWidth={2.3} />
            </View>
            <View>
              <Text style={styles.glassPillTitle}>Ambulance Hotlines</Text>
              <Text style={styles.glassPillSub}>Direct dial verified responders</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        {ambulances.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ambulance color="#9BB3C9" size={30} strokeWidth={2} />
            </View>
            <Text style={styles.emptyText}>No emergency response units found active.</Text>
          </View>
        ) : (
          ambulances.map((unit) => (
            <View key={unit.id} style={styles.dispatchCard}>
              <View style={styles.cardInfo}>
                <View style={styles.titleRow}>
                  <View style={styles.unitIconCircle}>
                    <View style={styles.iconCircleGloss} />
                    <Ambulance color="#0057B8" size={18} strokeWidth={2.3} />
                  </View>
                  <Text style={styles.medicName} numberOfLines={1}>{unit.name}</Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin color="#64748B" size={13} />
                  <Text style={styles.detailText} numberOfLines={1}>{unit.location}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Phone color="#64748B" size={13} />
                  <Text style={styles.detailText}>{unit.phone}</Text>
                </View>
              </View>

              {/* Organized Action layout container */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {/* SMS Fallback Button — Now correctly mapped to trigger your SMS service */}
                <TouchableOpacity 
                  style={[styles.callButton, styles.smsButton]} 
                  onPress={() => triggerSMSFallback(unit.phone)}
                  activeOpacity={0.75}
                >
                  <View style={styles.btnGlossHighlight} />
                  <MessageSquare color="#FFF" size={16} strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Voice Call Button */}
                <TouchableOpacity 
                  style={[styles.callButton, styles.voiceButton]} 
                  onPress={() => handleDialCall(unit.phone)}
                  activeOpacity={0.75}
                >
                  <View style={styles.btnGlossHighlight} />
                  <Phone color="#FFF" size={16} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6F4FE" },

  // Floating glass header — same family as home page pill
  floatingHeader: { paddingTop: 56, paddingHorizontal: 18, paddingBottom: 14 },
  glassPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#1D2D44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  glassPillLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  glassIconDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF3FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  glassPillTitle: { fontSize: 17, fontWeight: "800", color: "#1D2D44" },
  glassPillSub: { fontSize: 11.5, color: "#8A9BAE", fontWeight: "500", marginTop: 1 },

  scrollPadding: { paddingHorizontal: 20, paddingBottom: 140, paddingTop: 4 },

  // Loading state
  centerWrap: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E6F4FE", paddingHorizontal: 40 },
  loadingGlassCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 30,
    alignItems: "center",
    gap: 12,
    shadowColor: "#1D2D44",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  loadingText: { fontSize: 13, color: "#0057B8", fontWeight: "600", textAlign: "center" },

  // Empty state
  emptyState: { paddingVertical: 60, alignItems: "center", gap: 14 },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1D2D44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyText: { color: "#9BB3C9", fontSize: 14, fontWeight: "500" },

  // Dispatch card
  dispatchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EDF2F8",
    shadowColor: "#1D2D44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardInfo: { flex: 1, gap: 6 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 2, gap: 10 },
  unitIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E6F4FE",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  iconCircleGloss: {
    position: "absolute",
    top: -6,
    left: -4,
    width: 40,
    height: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.5)",
    transform: [{ rotate: "-8deg" }],
  },
  medicName: { fontSize: 16, fontWeight: "700", color: "#1D2D44", flex: 1 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 13, color: "#64748B", fontWeight: "500", flex: 1 },

  // Action buttons with gloss highlight
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  smsButton: {
    backgroundColor: "#64748B",
    shadowColor: "#475569",
  },
  voiceButton: {
    backgroundColor: "#0057B8",
    shadowColor: "#003D82",
  },
  btnGlossHighlight: {
    position: "absolute",
    top: -10,
    left: -6,
    width: 50,
    height: 24,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.22)",
    transform: [{ rotate: "-10deg" }],
  },
});