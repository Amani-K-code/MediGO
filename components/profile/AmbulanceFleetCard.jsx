import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Minus, Plus } from "lucide-react-native";

export default function AmbulanceFleetCard({
  totalAmbulances,
  availableAmbulances,
  onUpdateAvailable,
  onError,
}) {
  const atMin = availableAmbulances <= 0;
  const atMax = availableAmbulances >= totalAmbulances;

  const handleDecrement = () => {
    if (atMin) return;
    onUpdateAvailable(availableAmbulances - 1);
  };

  const handleIncrement = () => {
    if (atMax) return;
    onUpdateAvailable(availableAmbulances + 1);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ambulance Fleet</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Total Registered</Text>
        <Text style={styles.rowValue}>{totalAmbulances}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Currently Available</Text>
        <View style={styles.stepperControls}>
          <TouchableOpacity
            style={[styles.stepperBtn, atMin && styles.stepperBtnDisabled]}
            onPress={handleDecrement}
            disabled={atMin}
          >
            <Minus color={atMin ? "#9CA3AF" : "#0066FF"} size={18} />
          </TouchableOpacity>
          <Text style={styles.stepperValue}>{availableAmbulances}</Text>
          <TouchableOpacity
            style={[styles.stepperBtn, atMax && styles.stepperBtnDisabled]}
            onPress={handleIncrement}
            disabled={atMax}
          >
            <Plus color={atMax ? "#9CA3AF" : "#0066FF"} size={18} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.caption}>
        {`${availableAmbulances} of ${totalAmbulances} ambulances currently functional and available for dispatch.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "rgba(0,102,255,0.12)",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    shadowOpacity: 1,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A0F2C",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0A0F2C",
  },
  rowValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0A0F2C",
  },
  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnDisabled: {
    backgroundColor: "#F0F4FF",
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0A0F2C",
    minWidth: 20,
    textAlign: "center",
  },
  caption: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 16,
  },
});
