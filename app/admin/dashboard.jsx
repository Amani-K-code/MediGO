import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ReportsScreen from "./reports";

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState("verifications"); // "verifications" or "reports"
  const [medics, setMedics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // tracks which medic id is loading

  useEffect(() => {
    fetchMedics();
  }, []);

  const fetchMedics = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const medicList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "medic") {
          medicList.push({ id: doc.id, ...data });
        }
      });
      setMedics(medicList);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMedics();
  };

  const approveMedic = async (id) => {
    setActionLoading(id + "_approve");
    await updateDoc(doc(db, "users", id), { status: "approved" });
    setActionLoading(null);
    fetchMedics();
  };

  const rejectMedic = async (id) => {
    setActionLoading(id + "_reject");
    await updateDoc(doc(db, "users", id), { status: "rejected" });
    setActionLoading(null);
    fetchMedics();
  };

  const pending = medics.filter((m) => m.status === "pending");
  const approved = medics.filter((m) => m.status === "approved");
  const rejected = medics.filter((m) => m.status === "rejected");

  const getStatusStyle = (status) => {
    if (status === "approved") return { bg: "#DCFCE7", text: "#16A34A" };
    if (status === "rejected") return { bg: "#FEE2E2", text: "#DC2626" };
    return { bg: "#FEF3C7", text: "#D97706" };
  };

  const getStatusLabel = (status) => {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0057B8" />

      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerInner}>
            <View>
              <Text style={styles.headerTitle}>Admin Panel</Text>
              <Text style={styles.headerSub}>
                {currentTab === "verifications" ? "Facility Verifications" : "System Reports & Logs"}
              </Text>
            </View>
            <View style={styles.headerIconBox}>
              <MaterialCommunityIcons 
                name={currentTab === "verifications" ? "shield-check" : "file-chart"} 
                size={22} 
                color="#FFFFFF" 
              />
            </View>
          </View>

          {/* Core View Switch Toggle Bar */}
          <View style={styles.toggleBarContainer}>
            <TouchableOpacity 
              style={[styles.toggleBarBtn, currentTab === "verifications" && styles.toggleBarBtnActive]}
              onPress={() => setCurrentTab("verifications")}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons 
                name="shield-check" 
                size={16} 
                color={currentTab === "verifications" ? "#0057B8" : "rgba(255,255,255,0.8)"} 
              />
              <Text style={[styles.toggleBarText, currentTab === "verifications" && styles.toggleBarTextActive]}>
                Verifications
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleBarBtn, currentTab === "reports" && styles.toggleBarBtnActive]}
              onPress={() => setCurrentTab("reports")}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons 
                name="chart-box" 
                size={16} 
                color={currentTab === "reports" ? "#0057B8" : "rgba(255,255,255,0.8)"} 
              />
              <Text style={[styles.toggleBarText, currentTab === "reports" && styles.toggleBarTextActive]}>
                Reports & Analytics
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats strip — Only renders when on verifications list view */}
          {currentTab === "verifications" && (
            <View style={styles.statsRow}>
              <StatChip label="Pending" count={pending.length} color="#FCD34D" />
              <StatChip label="Approved" count={approved.length} color="#4ADE80" />
              <StatChip label="Rejected" count={rejected.length} color="#F87171" />
            </View>
          )}
        </SafeAreaView>
      </View>

      {/* Main Body Switch Handling Layout */}
      {currentTab === "reports" ? (
        <ReportsScreen />
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0057B8" />
          <Text style={styles.loadingText}>Loading facilities...</Text>
        </View>
      ) : medics.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="hospital-building" size={56} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No facilities yet</Text>
          <Text style={styles.emptyDesc}>Registered facilities will appear here for review.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0057B8" />
          }
        >
          {/* Pending section first */}
          {pending.length > 0 && (
            <SectionHeader label="Awaiting Review" count={pending.length} />
          )}
          {pending.map((medic) => (
            <MedicCard
              key={medic.id}
              medic={medic}
              getStatusStyle={getStatusStyle}
              getStatusLabel={getStatusLabel}
              onApprove={() => approveMedic(medic.id)}
              onReject={() => rejectMedic(medic.id)}
              actionLoading={actionLoading}
              showActions={true}
            />
          ))}

          {/* Approved */}
          {approved.length > 0 && (
            <SectionHeader label="Approved" count={approved.length} />
          )}
          {approved.map((medic) => (
            <MedicCard
              key={medic.id}
              medic={medic}
              getStatusStyle={getStatusStyle}
              getStatusLabel={getStatusLabel}
              onApprove={() => approveMedic(medic.id)}
              onReject={() => rejectMedic(medic.id)}
              actionLoading={actionLoading}
              showActions={false}
            />
          ))}

          {/* Rejected */}
          {rejected.length > 0 && (
            <SectionHeader label="Rejected" count={rejected.length} />
          )}
          {rejected.map((medic) => (
            <MedicCard
              key={medic.id}
              medic={medic}
              getStatusStyle={getStatusStyle}
              getStatusLabel={getStatusLabel}
              onApprove={() => approveMedic(medic.id)}
              onReject={() => rejectMedic(medic.id)}
              actionLoading={actionLoading}
              showActions={false}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────

function StatChip({ label, count, color }) {
  return (
    <View style={statStyles.chip}>
      <View style={[statStyles.dot, { backgroundColor: color }]} />
      <Text style={statStyles.count}>{count}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function SectionHeader({ label, count }) {
  return (
    <View style={sectionStyles.row}>
      <Text style={sectionStyles.label}>{label}</Text>
      <View style={sectionStyles.badge}>
        <Text style={sectionStyles.badgeText}>{count}</Text>
      </View>
    </View>
  );
}

function MedicCard({
  medic,
  getStatusStyle,
  getStatusLabel,
  onApprove,
  onReject,
  actionLoading,
  showActions,
}) {
  const statusStyle = getStatusStyle(medic.status);
  const isApprovingThis = actionLoading === medic.id + "_approve";
  const isRejectingThis = actionLoading === medic.id + "_reject";

  return (
    <View style={cardStyles.card}>
      {/* Top row */}
      <View style={cardStyles.topRow}>
        <View style={cardStyles.iconBox}>
          <MaterialCommunityIcons name="hospital-building" size={22} color="#0057B8" />
        </View>
        <View style={cardStyles.info}>
          <Text style={cardStyles.name} numberOfLines={1}>
            {medic.establishmentName || "Unnamed Facility"}
          </Text>
          <Text style={cardStyles.meta}>
            {medic.email || "—"}
          </Text>
        </View>
        <View style={[cardStyles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[cardStyles.statusText, { color: statusStyle.text }]}>
            {getStatusLabel(medic.status)}
          </Text>
        </View>
      </View>

      {/* Detail row */}
      <View style={cardStyles.detailRow}>
        {medic.phone ? (
          <View style={cardStyles.detailChip}>
            <Ionicons name="call-outline" size={13} color="#6B7280" />
            <Text style={cardStyles.detailText}>{medic.phone}</Text>
          </View>
        ) : null}
        {medic.location ? (
          <View style={cardStyles.detailChip}>
            <Ionicons name="location-outline" size={13} color="#6B7280" />
            <Text style={cardStyles.detailText}>{medic.location}</Text>
          </View>
        ) : null}
        {medic.licenseNumber ? (
          <View style={cardStyles.detailChip}>
            <Ionicons name="document-text-outline" size={13} color="#6B7280" />
            <Text style={cardStyles.detailText}>Lic: {medic.licenseNumber}</Text>
          </View>
        ) : null}
      </View>

      {/* Action buttons — only for pending */}
      {showActions && (
        <View style={cardStyles.actionRow}>
          <TouchableOpacity
            style={[cardStyles.rejectBtn, isRejectingThis && cardStyles.btnDisabled]}
            onPress={onReject}
            disabled={!!actionLoading}
            activeOpacity={0.8}
          >
            {isRejectingThis ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Ionicons name="close" size={16} color="#DC2626" />
                <Text style={cardStyles.rejectBtnText}>Reject</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[cardStyles.approveBtn, isApprovingThis && cardStyles.btnDisabled]}
            onPress={onApprove}
            disabled={!!actionLoading}
            activeOpacity={0.8}
          >
            {isApprovingThis ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={cardStyles.approveBtnText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F9FC" },
  header: { backgroundColor: "#0057B8", paddingBottom: 16, paddingHorizontal: 20 },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#FFFFFF" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleBarContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
  },
  toggleBarBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  toggleBarBtnActive: {
    backgroundColor: "#FFFFFF",
  },
  toggleBarText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E2E8F0",
  },
  toggleBarTextActive: {
    color: "#0057B8",
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 4,
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  loadingText: { marginTop: 12, fontSize: 14, color: "#6B7280" },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937", marginTop: 16 },
  emptyDesc: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 8, lineHeight: 20 },
});

const statStyles = StyleSheet.create({
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  count: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },
  label: { fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: "500" },
});

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
    gap: 8,
  },
  label: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  badge: {
    backgroundColor: "#EEF3FF",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#0057B8" },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#0057B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: { flex: 1, marginRight: 8 },
  name: { fontSize: 15, fontWeight: "700", color: "#1F2937" },
  meta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  detailRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  detailChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  detailText: { fontSize: 12, color: "#6B7280" },
  actionRow: { flexDirection: "row", gap: 10 },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  rejectBtnText: { fontSize: 14, fontWeight: "700", color: "#DC2626" },
  approveBtn: {
    flex: 2,
    flexDirection: "row",
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0057B8",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  approveBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  btnDisabled: { opacity: 0.6 },
});