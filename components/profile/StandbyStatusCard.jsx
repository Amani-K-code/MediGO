import React, { useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Info } from "lucide-react-native";

export default function StandbyStatusCard({ enabled, onToggle, onError }) {
  const [switching, setSwitching] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleToggle = async (next) => {
    setSwitching(true);
    try {
      const res = await onToggle(next);
      if (!res.ok) {
        onError?.(res.message);
      }
    } finally {
      setSwitching(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Standby Status</Text>
        <TouchableOpacity onPress={() => setShowInfo(!showInfo)} style={styles.infoButton}>
          <Info color="#6B7280" size={14} />
        </TouchableOpacity>
      </View>

      {showInfo && (
        <Text style={styles.infoText}>
          When enabled, verified emergency responders in your vicinity can view your critical
          medical information to assist you faster.
        </Text>
      )}

      <View style={styles.row}>
        <Text style={styles.description}>
          Broadcast critical medical information to verified responders in your vicinity during
          emergencies.
        </Text>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ true: "#0066FF", false: "#E5E7EB" }}
          disabled={switching}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "rgba(0,102,255,0.12)",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 1,
    elevation: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A0F2C",
  },
  infoButton: {
    padding: 2,
  },
  infoText: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  description: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    marginRight: 12,
    lineHeight: 18,
  },
});
