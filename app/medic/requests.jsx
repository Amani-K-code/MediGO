import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert, Linking } from "react-native";
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { AlertCircle, CheckCircle, Clock, ShieldAlert, Navigation, MapPin, Stethoscope } from "lucide-react-native";

export default function RequestsScreen({ autoTriggerRequestId, clearAutoTrigger }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Modal details
  const [assigningRequestId, setAssigningRequestId] = useState(null);
  const [driverName, setDriverName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [selectedETA, setSelectedETA] = useState(10);
  const [medicNotes, setMedicNotes] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "requests"),
      (snapshot) => {
        const reqList = [];
        snapshot.forEach((doc) => {
          reqList.push({ id: doc.id, ...doc.data() });
        });
        reqList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setRequests(reqList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching requests: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (autoTriggerRequestId) {
      const targetReq = requests.find((r) => r.id === autoTriggerRequestId);
      if (targetReq) {
        setSelectedRequest(targetReq);
        if (clearAutoTrigger) clearAutoTrigger();
      }
    }
  }, [autoTriggerRequestId, requests]);

  const openInMaps = (latitude, longitude) => {
    if (!latitude || !longitude) {
      Alert.alert("No Location", "This request has no location data.");
      return;
    }
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
    });
  };

  // The request currently being assigned — used to conditionally show standby-specific fields
  const assigningReq = requests.find((r) => r.id === assigningRequestId);
  const isAssigningStandby = assigningReq?.type === "standby";

  const handleConfirmDispatch = async () => {
    if (!assigningRequestId) return;
    try {
      const docRef = doc(db, "requests", assigningRequestId);
      await updateDoc(docRef, {
        status: "dispatched",
        driverName: driverName || "Paramedic Team",
        plateNumber: plateNumber || "N/A",
        estimatedArrivalMinutes: selectedETA,
        medicNotes: medicNotes.trim() || null,
        dispatchedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setAssigningRequestId(null);
      setDriverName("");
      setPlateNumber("");
      setSelectedETA(10);
      setMedicNotes("");
    } catch (error) {
      console.error("Error dispatching ambulance: ", error);
    }
  };

  const markRequestCompleted = async (id) => {
    try {
      await updateDoc(doc(db, "requests", id), {
        status: "completed",
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        paymentStatus: "pending",
      });
    } catch (error) {
      console.error("Error marking request as completed: ", error);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "pending") return req.status === "pending" || req.status === "requested";
    if (filter === "active") return req.status === "dispatched";
    return req.status !== "completed";
  });

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <View style={styles.loadingGlassCard}>
          <ActivityIndicator size="large" color="#0057B8" />
          <Text style={styles.loadingText}>Syncing Live Triage Stream...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.floatingHeader}>
        <View style={styles.glassPill}>
          <View>
            <Text style={styles.headerSubtitle}>MediGo Incident Terminal</Text>
            <Text style={styles.headerTitle}>Emergency Requests</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {filteredRequests.length} {filter === "all" ? "Total" : filter === "active" ? "Active" : "Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.filterBar}>
          {["all", "pending", "active"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterPill, filter === type && styles.filterPillActive]}
              onPress={() => setFilter(type)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Clock size={32} color="#9BB3C9" />
            </View>
            <Text style={styles.emptyText}>No matching logs found in this channel.</Text>
          </View>
        ) : (
          filteredRequests.map((req) => {
            const isEmergency = req.type === "emergency";
            const isStandby = req.type === "standby";
            const isDispatched = req.status === "dispatched";
            const initials = getInitials(req.userName);

            return (
              <View key={req.id} style={[styles.card, isEmergency && styles.emergencyCard]}>
                {isEmergency && !isDispatched && (
                  <View style={styles.requestingBanner}>
                    <View style={styles.requestingBannerLeft}>
                      <AlertCircle size={14} color="#D62828" strokeWidth={2.4} />
                      <Text style={styles.requestingBannerText}>REQUESTING HELP</Text>
                    </View>
                    <Text style={styles.requestingBannerTime}>Live</Text>
                  </View>
                )}

                <View style={styles.cardBody}>
                  <View style={styles.identityRow}>
                    <View style={[styles.avatarCircle, isEmergency ? styles.avatarRed : styles.avatarBlue]}>
                      <View style={styles.avatarGloss} />
                      <Text style={[styles.avatarText, isEmergency ? styles.avatarTextRed : styles.avatarTextBlue]}>
                        {initials}
                      </Text>
                    </View>

                    <View style={styles.identityInfo}>
                      <Text style={styles.citizenName}>{req.userName || "Unknown Citizen"}</Text>
                      <View style={styles.locationRow}>
                        <MapPin size={12} color="#94A3B8" />
                        <Text style={styles.locationText} numberOfLines={1}>
                          Lat: {req.latitude?.toString().slice(0, 8)}, Lon: {req.longitude?.toString().slice(0, 8)}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.viewMapBtn}
                        activeOpacity={0.8}
                        onPress={() => openInMaps(req.latitude, req.longitude)}
                      >
                        <Navigation size={12} color="#0057B8" />
                        <Text style={styles.viewMapText}>View on Map</Text>
                      </TouchableOpacity>
                    </View>

                    {!isEmergency && (
                      <Text style={styles.timeAgoText}>•</Text>
                    )}
                  </View>

                  <View style={styles.pillRow}>
                    <View style={[styles.typePill, isEmergency ? styles.typePillRed : styles.typePillOrange]}>
                      <AlertCircle size={12} color={isEmergency ? "#D62828" : "#FF9F1C"} />
                      <Text style={[styles.typePillText, { color: isEmergency ? "#D62828" : "#FF9F1C" }]}>
                        {req.type?.toUpperCase() || "STANDBY"}
                      </Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{req.status || "pending"}</Text>
                    </View>
                  </View>

                  {/* Standby-only: possible issue selected by the citizen */}
                  {isStandby && req.issue && (
                    <View style={styles.issueBox}>
                      <Stethoscope size={14} color="#B45309" style={{ marginTop: 2 }} />
                      <Text style={styles.issueText}>
                        Possible Issue: <Text style={styles.bold}>{req.issue}</Text>
                      </Text>
                    </View>
                  )}

                  {req.notes && (
                    <View style={styles.notesBox}>
                      <ShieldAlert size={14} color="#64748B" style={{ marginTop: 2 }} />
                      <Text style={styles.notesText}>{req.notes}</Text>
                    </View>
                  )}

                  {isDispatched && (
                    <View style={styles.trackingSummary}>
                      <Text style={styles.trackingTitle}>Dispatched Fleet Details</Text>
                      <Text style={styles.trackingDetail}>🚐 Vehicle: {req.plateNumber}</Text>
                      <Text style={styles.trackingDetail}>🧑‍⚕️ Driver: {req.driverName}</Text>
                      <Text style={styles.trackingDetail}>⏱️ ETA Selected: {req.estimatedArrivalMinutes} Mins</Text>
                      {req.medicNotes ? (
                        <Text style={styles.trackingDetail}>📝 Notes: {req.medicNotes}</Text>
                      ) : null}
                    </View>
                  )}

                  <View style={styles.actionRow}>
                    {!isDispatched ? (
                      <TouchableOpacity
                        style={[styles.btnAccept, isEmergency && styles.btnAcceptEmergency]}
                        onPress={() => setAssigningRequestId(req.id)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.btnGloss} />
                        <Navigation size={16} color="#fff" />
                        <Text style={styles.btnText}>Assign & Dispatch</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.btnComplete}
                        onPress={() => markRequestCompleted(req.id)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.btnGloss} />
                        <CheckCircle size={16} color="#fff" />
                        <Text style={styles.btnText}>Mark Resolved</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {assigningRequestId !== null && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%", alignItems: "center", justifyContent: "center" }}
          >
            <ScrollView style={styles.modalScroll} contentContainerStyle={{ alignItems: "center" }}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Dispatch Asset Assignment</Text>
                <Text style={styles.modalSub}>Provide active transponder credentials for citizen notifications stream.</Text>

                {/* Standby-only: show the citizen's reported issue as read-only context */}
                {isAssigningStandby && assigningReq?.issue && (
                  <View style={styles.issueReadonlyBox}>
                    <Stethoscope size={14} color="#B45309" />
                    <Text style={styles.issueReadonlyText}>
                      Reported Issue: <Text style={styles.bold}>{assigningReq.issue}</Text>
                    </Text>
                  </View>
                )}

                <Text style={styles.fieldLabel}>Driver / Lead Paramedic Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Officer Alex Kiprop"
                  value={driverName}
                  onChangeText={setDriverName}
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.fieldLabel}>Ambulance Plate Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. KGA 482Y"
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                />

                <Text style={styles.fieldLabel}>Select Expected ETA Option</Text>
                <View style={styles.pickerRow}>
                  {[5, 10, 20].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      style={[styles.pickerCard, selectedETA === mins && styles.pickerCardSelected]}
                      onPress={() => setSelectedETA(mins)}
                    >
                      <Text style={[styles.pickerCardText, selectedETA === mins && styles.pickerCardTextActive]}>
                        {mins} Mins
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Standby-only: instructions/equipment notes for the response team, entered at dispatch time */}
                {isAssigningStandby && (
                  <>
                    <Text style={styles.fieldLabel}>Instructions & Equipment Notes for Response Team</Text>
                    <TextInput
                      style={[styles.textInput, styles.notesInput]}
                      placeholder="e.g. Bring insulin kit, patient has history of seizures..."
                      value={medicNotes}
                      onChangeText={setMedicNotes}
                      placeholderTextColor="#94A3B8"
                      multiline
                    />
                  </>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.btnCancel} onPress={() => {
                    setAssigningRequestId(null);
                    setMedicNotes("");
                  }}>
                    <Text style={styles.btnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnConfirmDispatch} onPress={handleConfirmDispatch}>
                    <Text style={styles.btnText}>Transmit Fleet Live</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6F4FE" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E6F4FE", paddingHorizontal: 40 },
  loadingGlassCard: {
    backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 24, paddingVertical: 30, paddingHorizontal: 30,
    alignItems: "center", gap: 12, shadowColor: "#1D2D44", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
  },
  loadingText: { color: "#0057B8", fontWeight: "600", fontSize: 13, textAlign: "center" },
  floatingHeader: { paddingTop: 56, paddingHorizontal: 18, paddingBottom: 16 },
  glassPill: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.92)", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 22,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.9)", shadowColor: "#1D2D44",
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 6, marginBottom: 12,
  },
  headerSubtitle: { fontSize: 10.5, fontWeight: "700", color: "#0057B8", textTransform: "uppercase", letterSpacing: 0.4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#1D2D44", marginTop: 2 },
  countBadge: { backgroundColor: "#E6F4FE", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginTop: 2 },
  countBadgeText: { fontSize: 11, fontWeight: "700", color: "#0057B8" },
  filterBar: { flexDirection: "row", gap: 8 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.8)", borderWidth: 1, borderColor: "#E2E8F0",
  },
  filterPillActive: {
    backgroundColor: "#0057B8", borderColor: "#0057B8", shadowColor: "#0057B8",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  filterText: { fontSize: 11, fontWeight: "700", color: "#64748B" },
  filterTextActive: { color: "#fff" },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 130, paddingTop: 4 },
  card: {
    backgroundColor: "#fff", borderRadius: 22, marginBottom: 16, borderWidth: 1, borderColor: "#EDF2F8",
    shadowColor: "#1D2D44", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 14,
    elevation: 4, overflow: "hidden",
  },
  emergencyCard: { borderColor: "#FCA5A5" },
  cardBody: { padding: 18 },
  requestingBanner: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FDECEC",
    paddingHorizontal: 18, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F8C9C9",
  },
  requestingBannerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  requestingBannerText: { fontSize: 11.5, fontWeight: "800", color: "#D62828", letterSpacing: 0.3 },
  requestingBannerTime: { fontSize: 12, fontWeight: "600", color: "#D62828" },
  identityRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarCircle: {
    width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center",
    marginRight: 14, overflow: "hidden",
  },
  avatarRed: { backgroundColor: "#FDECEC" },
  avatarBlue: { backgroundColor: "#E6F4FE" },
  avatarGloss: {
    position: "absolute", top: -10, left: -6, width: 60, height: 28, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.55)", transform: [{ rotate: "-8deg" }],
  },
  avatarText: { fontSize: 16, fontWeight: "800" },
  avatarTextRed: { color: "#D62828" },
  avatarTextBlue: { color: "#0057B8" },
  identityInfo: { flex: 1 },
  citizenName: { fontSize: 17, fontWeight: "800", color: "#1D2D44" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  locationText: { fontSize: 12, color: "#94A3B8", fontWeight: "500", flex: 1 },
  timeAgoText: { fontSize: 13, color: "#94A3B8" },
  viewMapBtn: {
    flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, alignSelf: "flex-start",
    backgroundColor: "#E6F4FE", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
  },
  viewMapText: { fontSize: 11, fontWeight: "700", color: "#0057B8" },
  pillRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  typePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  typePillRed: { backgroundColor: "#FCE8E6" },
  typePillOrange: { backgroundColor: "#FFF3E0" },
  typePillText: { fontSize: 10.5, fontWeight: "800" },
  statusPill: { backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusPillText: { fontSize: 10.5, fontWeight: "700", color: "#64748B", textTransform: "capitalize" },
  bold: { fontWeight: "700" },

  // Standby possible-issue readout on the card
  issueBox: {
    flexDirection: "row", gap: 6, backgroundColor: "#FFFBEB", padding: 10, borderRadius: 10,
    marginTop: 10, borderWidth: 1, borderColor: "#FDE68A",
  },
  issueText: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 16, fontWeight: "500" },

  notesBox: { flexDirection: "row", gap: 6, backgroundColor: "#F8FAFC", padding: 10, borderRadius: 10, marginTop: 10, borderWidth: 1, borderColor: "#EDF2F7" },
  notesText: { flex: 1, fontSize: 12, color: "#475569", lineHeight: 16, fontWeight: "500" },
  trackingSummary: { marginTop: 12, backgroundColor: "#EFF6FF", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#BFDBFE" },
  trackingTitle: { fontSize: 12, fontWeight: "700", color: "#1E40AF", marginBottom: 4 },
  trackingDetail: { fontSize: 12, color: "#1E40AF", fontWeight: "500", marginTop: 2 },
  actionRow: { marginTop: 16 },
  btnAccept: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#0057B8", paddingVertical: 14, borderRadius: 18, overflow: "hidden",
    shadowColor: "#003D82", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnAcceptEmergency: { backgroundColor: "#D62828", shadowColor: "#9D1D1D" },
  btnComplete: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#2A9D8F", paddingVertical: 14, borderRadius: 18, overflow: "hidden",
    shadowColor: "#1E7268", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnGloss: {
    position: "absolute", top: -16, left: -10, width: 160, height: 40, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.16)", transform: [{ rotate: "-6deg" }],
  },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  emptyState: { padding: 40, alignItems: "center", justifyContent: "center", marginTop: 40, gap: 14 },
  emptyIconCircle: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: "#FFFFFF", justifyContent: "center",
    alignItems: "center", shadowColor: "#1D2D44", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06,
    shadowRadius: 10, elevation: 2,
  },
  emptyText: { color: "#64748B", fontSize: 13, fontWeight: "500", textAlign: "center" },
  modalOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center", paddingHorizontal: 20, zIndex: 100,
  },
  modalScroll: { maxHeight: "90%", width: "100%" },
  modalContent: {
    backgroundColor: "#fff", borderRadius: 24, padding: 24, width: "100%", maxWidth: 400,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1D2D44" },
  modalSub: { fontSize: 12, color: "#64748B", marginTop: 2, marginBottom: 16 },
  issueReadonlyBox: {
    flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFBEB",
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#FDE68A", marginBottom: 16,
  },
  issueReadonlyText: { fontSize: 12.5, color: "#92400E", flex: 1 },
  fieldLabel: { fontSize: 11, fontWeight: "700", color: "#475569", marginTop: 12, marginBottom: 6, textTransform: "uppercase" },
  textInput: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 12, fontSize: 14, color: "#1D2D44" },
  notesInput: { minHeight: 70, textAlignVertical: "top" },
  pickerRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  pickerCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#F8FAFC", alignItems: "center" },
  pickerCardSelected: { borderColor: "#0057B8", backgroundColor: "#E6F4FE" },
  pickerCardText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  pickerCardTextActive: { color: "#0057B8", fontWeight: "700" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderColor: "#EDF2F7" },
  btnCancel: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center", backgroundColor: "#EDF2F7" },
  btnCancelText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
  btnConfirmDispatch: { flex: 2, padding: 12, borderRadius: 12, alignItems: "center", backgroundColor: "#0057B8" },
});