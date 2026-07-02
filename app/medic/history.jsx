import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { listenToMedicHistory } from "../services/historyService";
import { Clock, CheckCircle2, AlertTriangle, CreditCard } from "lucide-react-native";

export default function HistoryScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToMedicHistory((data) => {
      setLogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatTime = (ts) => {
    if (!ts) return "---";
    const d = new Date(ts.seconds * 1000);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0057B8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dispatch logs & History</Text>
      
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {logs.length === 0 ? (
          <View style={styles.empty}>
            <Clock size={36} color="#94A3B8" />
            <Text style={styles.emptyText}>No dispatch history logs registered under your station.</Text>
          </View>
        ) : (
          logs.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.citizenName}>{item.userName || "Citizen Profile"}</Text>
                <View style={[styles.badge, item.status === "completed" ? styles.badgeSuccess : styles.badgeWarning]}>
                  {item.status === "completed" ? (
                    <CheckCircle2 size={12} color="#15803D" />
                  ) : (
                    <AlertTriangle size={12} color="#B45309" />
                  )}
                  <Text style={[styles.badgeText, { color: item.status === "completed" ? "#15803D" : "#B45309" }]}>
                    {(item.status || "PENDING").toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.metaText}> Vehicle: {item.plateNumber || "N/A"} {item.driverName ? `(${item.driverName})` : ""}</Text>
              <Text style={styles.metaText}> Logged: {formatTime(item.createdAt || item.updatedAt || item.dispatchedAt)}</Text>

              {/* Real-time Payment Tracking Box */}
              {item.paymentPending && (
                <View style={styles.billingAlert}>
                  <CreditCard size={14} color="#B45309" />
                  <Text style={styles.billingAlertText}>Pending Patient Coverage Remittance</Text>
                </View>
              )}

              {item.feedback && (
                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackTitle}>Citizen Review ({item.rating || 5}⭐)</Text>
                  <Text style={styles.feedbackBody}>{`"${item.feedback}"`}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6F4FE", paddingTop: 60, paddingHorizontal: 16 },
  header: { fontSize: 22, fontWeight: "800", color: "#1D2D44", marginBottom: 16 },
  scroll: { paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E6F4FE" },
  empty: { alignItems: "center", marginTop: 60, gap: 8 },
  emptyText: { color: "#64748B", fontSize: 14, fontWeight: "500", textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#EDF2F8" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  citizenName: { fontSize: 16, fontWeight: "700", color: "#1D2D44" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeSuccess: { backgroundColor: "#DCFCE7" },
  badgeWarning: { backgroundColor: "#FEF3C7" },
  badgeText: { fontSize: 10, fontWeight: "700" },
  metaText: { fontSize: 13, color: "#64748B", marginTop: 2, fontWeight: "500" },
  billingAlert: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFF9E6", padding: 8, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: "#FDE68A" },
  billingAlertText: { fontSize: 12, color: "#B45309", fontWeight: "600" },
  feedbackBox: { marginTop: 12, backgroundColor: "#F8FAFC", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  feedbackTitle: { fontSize: 11, fontWeight: "700", color: "#475569" },
  feedbackBody: { fontSize: 12, color: "#1E293B", fontStyle: "italic", marginTop: 2 }
});