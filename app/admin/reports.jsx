import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { listenToGlobalUsers, listenToAllSystemRequests, listenToReviewsTimeline } from "../services/reportsService";
import { Users, FileText, Star, ShieldCheck } from "lucide-react-native";

export default function ReportsScreen() {
  const [viewMode, setViewMode] = useState("users"); // Switcher values: users / dispatches / reviews
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = listenToGlobalUsers(setUsers);
    const unsubRequests = listenToAllSystemRequests(setRequests);
    const unsubReviews = listenToReviewsTimeline((data) => {
      setReviews(data);
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubRequests();
      unsubReviews();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0057B8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>System Command Control</Text>

      {/* Controller Dock Menu */}
      <View style={styles.tabMenu}>
        <TouchableOpacity style={[styles.menuBtn, viewMode === "users" && styles.menuBtnActive]} onPress={() => setViewMode("users")}>
          <Users size={16} color={viewMode === "users" ? "#fff" : "#64748B"} />
          <Text style={[styles.menuBtnText, viewMode === "users" && styles.menuBtnTextActive]}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuBtn, viewMode === "dispatches" && styles.menuBtnActive]} onPress={() => setViewMode("dispatches")}>
          <FileText size={16} color={viewMode === "dispatches" ? "#fff" : "#64748B"} />
          <Text style={[styles.menuBtnText, viewMode === "dispatches" && styles.menuBtnTextActive]}>Dispatches</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuBtn, viewMode === "reviews" && styles.menuBtnActive]} onPress={() => setViewMode("reviews")}>
          <Star size={16} color={viewMode === "reviews" ? "#fff" : "#64748B"} />
          <Text style={[styles.menuBtnText, viewMode === "reviews" && styles.menuBtnTextActive]}>Reviews</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* VIEW 1: REGISTRATION TELEMETRY TABLE */}
        {viewMode === "users" && (
          <View style={styles.tableCard}>
            <Text style={styles.tableTitle}>Global Registry Map</Text>
            <View style={styles.thRow}>
              <Text style={[styles.th, { flex: 2 }]}>Full Name</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>System Role</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>Status</Text>
            </View>
            {users.map((u, idx) => (
              <View key={u.id || idx} style={styles.tdRow}>
                <Text style={[styles.td, { flex: 2, fontWeight: "700" }]} numberOfLines={1}>{u.fullName || u.establishmentName || "N/A"}</Text>
                <Text style={[styles.td, { flex: 1.2, textTransform: "capitalize" }]}>{u.role || "Citizen"}</Text>
                <Text style={[styles.td, { flex: 1.2, color: u.status === "approved" ? "#16A34A" : "#2563EB", fontWeight: "bold" }]}>{u.status || "Active"}</Text>
              </View>
            ))}
          </View>
        )}

        {/* VIEW 2: GLOBAL DISPATCH & PAYMENTS FEED */}
        {viewMode === "dispatches" && (
          <View style={{ gap: 10 }}>
            {requests.map((r) => (
              <View key={r.id} style={styles.cardItem}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardHeaderName}>{r.userName || "Emergency Call"}</Text>
                  <Text style={styles.cardStatusText}>{r.status?.toUpperCase()}</Text>
                </View>
                <Text style={styles.cardDetail}>Request Type: {r.type?.toUpperCase()}</Text>
                <Text style={styles.cardDetail}>Ambulance Dispatched: {r.driverName || "Not Assigned"}</Text>
                {r.paymentPending && (
                  <View style={styles.paymentFlag}>
                    <Text style={styles.paymentFlagText}>Awaiting Processing Fee Remittance</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* VIEW 3: CITIZEN SATISFACTION FEEDBACK LOGS */}
        {viewMode === "reviews" && (
          <View style={{ gap: 10 }}>
            {reviews.length === 0 ? (
              <Text style={styles.neutralPrompt}>No citizen rating drops logs captured on current stream index.</Text>
            ) : (
              reviews.map((rv) => (
                <View key={rv.id} style={styles.cardItem}>
                  <View style={styles.cardRow}>
                    <View>
                      <Text style={styles.cardHeaderName}>
                        {rv.userName || "Anonymous Citizen"}
                      </Text>
                      <Text style={{ fontSize: 10, color: "#94A3B8", fontWeight: "500", marginTop: 1 }}>
                        ID: {rv.userId ? rv.userId.slice(0, 10) + "..." : "—"}
                      </Text>
                    </View>
                    <Text style={styles.starDisplay}>{"⭐".repeat(rv.rating || 5)}</Text>
                  </View>
                  <Text style={styles.reviewComment}>{`"${rv.feedback || "System task finalized cleanly without narrative commentary details."}"`}</Text>
                </View>
                              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9", paddingTop: 60, paddingHorizontal: 16 },
  mainTitle: { fontSize: 22, fontWeight: "900", color: "#0F172A", marginBottom: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F1F5F9" },
  tabMenu: { flexDirection: "row", gap: 8, marginBottom: 16 },
  menuBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#FFF", paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  menuBtnActive: { backgroundColor: "#0057B8", borderColor: "#0057B8" },
  menuBtnText: { fontSize: 12, fontWeight: "700", color: "#64748B" },
  menuBtnTextActive: { color: "#FFF" },
  scroll: { paddingBottom: 40 },
  tableCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E2E8F0" },
  tableTitle: { fontSize: 15, fontWeight: "800", color: "#1E293B", marginBottom: 12 },
  thRow: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#F1F5F9", paddingBottom: 8, marginBottom: 6 },
  th: { fontSize: 11, fontWeight: "800", color: "#64748B", textTransform: "uppercase" },
  tdRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#F8FAFC", paddingVertical: 10, alignItems: "center" },
  td: { fontSize: 12, color: "#334155" },
  cardItem: { backgroundColor: "#FFF", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#E2E8F0" },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardHeaderName: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  cardStatusText: { fontSize: 10, fontWeight: "700", color: "#2563EB" },
  cardDetail: { fontSize: 12, color: "#475569", marginTop: 2 },
  paymentFlag: { marginTop: 8, backgroundColor: "#FFF1F2", padding: 6, borderRadius: 6, borderWidth: 1, borderColor: "#FFE4E6" },
  paymentFlagText: { fontSize: 11, color: "#E11D48", fontWeight: "700" },
  neutralPrompt: { color: "#64748B", fontSize: 13, textAlign: "center", marginTop: 40 },
  starDisplay: { fontSize: 12 },
  reviewComment: { fontSize: 13, color: "#334155", fontStyle: "italic", marginTop: 6, backgroundColor: "#F8FAFC", padding: 8, borderRadius: 8 }
});