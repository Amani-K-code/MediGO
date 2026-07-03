import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { Ambulance, Star, CreditCard, CheckCircle, Clock, Heart, X } from "lucide-react-native";
import { listenToLiveStreamUpdates, sendReviewFeedbackScore } from "../services/notificationService";

export default function NotificationsSheet({ isOpen, onClose }) {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [readAlertIds, setReadAlertIds] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = listenToLiveStreamUpdates((updates) => {
      setActiveAlerts(updates);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  // Intercept modal dismissal to flag current alerts as "read"
  const handleCloseSheet = () => {
    const currentIds = activeAlerts.map((alert) => alert.id);
    setReadAlertIds((prevRead) => {
      const merged = new Set([...prevRead, ...currentIds]);
      return Array.from(merged);
    });
    onClose();
  };

  const handleReviewSubmission = async (requestId) => {
    const response = await sendReviewFeedbackScore(requestId, rating, reviewText);
    if (response.success) {
      Alert.alert("Thank you", "Your feedback is highly appreciated.");
      setRating(0);
      setReviewText("");
    } else {
      Alert.alert("Error", "Failed to submit review. Please contact support.");
    }
  };

  // Separate alerts locally for immediate visual categorization
  const unreadAlerts = activeAlerts.filter((alert) => !readAlertIds.includes(alert.id));
  const readAlerts = activeAlerts.filter((alert) => readAlertIds.includes(alert.id));

  const renderAlertCard = (incident, isUnread) => (
    <View key={incident.id} style={[styles.cardContainer, !isUnread && styles.readCardSubtle]}>
      {/* CASE C: Already reviewed — show confirmation instead of form */}
      {incident.rating != null && incident.status === "completed" && (
        <View style={styles.reviewedCard}>
          <View style={styles.row}>
            <View style={styles.iconCircleCalm}>
              <CheckCircle color="#2E654C" size={20} />
            </View>
            <View style={styles.textBlock}>
              <View style={styles.headerBadgeRow}>
                <Text style={styles.alertHeading}>Review Submitted</Text>
                {!isUnread && (
                  <View style={styles.readBadge}>
                    <Text style={styles.readBadgeText}>Read</Text>
                  </View>
                )}
              </View>
              <Text style={styles.messageOfHope}>Thank you for your feedback. Your rating ({incident.rating}/5) has been recorded.</Text>
              {incident.feedback ? (
                <Text style={styles.metaLabel}>Your comment: <Text style={styles.bold}>{incident.feedback}</Text></Text>
              ) : null}
            </View>
          </View>
        </View>
      )}

      {/* CASE A: Ambulance Transit In-Route (not yet reviewed) */}
      {!incident.rating && incident.status === "dispatched" && (
        <View style={styles.dispatchCard}>
          <View style={styles.row}>
            <View style={styles.iconCircleCalm}>
              <Ambulance color="#2E654C" size={20} />
            </View>
            <View style={styles.textBlock}>
              <View style={styles.headerBadgeRow}>
                <Text style={styles.alertHeading}>Fleet En-Route</Text>
                {!isUnread && (
                  <View style={styles.readBadge}>
                    <Text style={styles.readBadgeText}>Read</Text>
                  </View>
                )}
              </View>
              <Text style={styles.messageOfHope}>Hold on, professional care is rushing to your location. Keep calm.</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Paramedic: <Text style={styles.bold}>{incident.driverName}</Text></Text>
                <Text style={styles.metaLabel}>Transponder: <Text style={styles.bold}>{incident.plateNumber}</Text></Text>
              </View>
            </View>
          </View>
          <View style={styles.etaIndicator}>
            <Clock size={14} color="#2E654C" />
            <Text style={styles.etaText}>Estimated Contact Time: {incident.estimatedArrivalMinutes} Minutes</Text>
          </View>
        </View>
      )}

      {/* CASE B: Completed / Pending Payment Action (not yet reviewed) */}
    {!incident.rating && (incident.status === "completed" || incident.status === "pending_payment" || incident.paymentPending === true) && (
    <View style={styles.billingCard}>
        <View style={styles.row}>
        <View style={styles.iconCircleRed}>
            <CreditCard color="#D62828" size={20} />
        </View>
        <View style={styles.textBlock}>
            <View style={styles.headerBadgeRow}>
            <Text style={styles.billingHeading}>Payment Pending</Text>
            {!isUnread && (
                <View style={styles.readBadge}>
                <Text style={styles.readBadgeText}>Read</Text>
                </View>
            )}
            </View>
            <Text style={styles.billingSub}>
            Please settle out-of-pocket metrics or clear billing invoices to:{"\n"}
            <Text style={styles.bold}>{incident.driverName}</Text>
            </Text>
        </View>
        </View>

    {/* Rating Component */}
    <View style={styles.ratingBox}>
      <Text style={styles.ratingTitle}>Rate Medical Response Squad</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity key={num} onPress={() => setRating(num)}>
            <Star size={24} color={num <= rating ? "#FF9F1C" : "#E2E8F0"} fill={num <= rating ? "#FF9F1C" : "transparent"} />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput 
        style={styles.textInput}
        placeholder="Provide care quality details..."
        placeholderTextColor="#94A3B8"
        value={reviewText}
        onChangeText={setReviewText}
      />
      <TouchableOpacity style={styles.btnSubmit} onPress={() => handleReviewSubmission(incident.id)}>
        <CheckCircle size={14} color="#fff" />
        <Text style={styles.btnText}>Submit Care Report & Close</Text>
      </TouchableOpacity>
    </View>
  </View>
)}
    </View>
  );

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={handleCloseSheet}>
      <View style={styles.modalBackdrop}>
        <TouchableOpacity style={styles.dismissDismissLayer} onPress={handleCloseSheet} activeOpacity={1} />
        
        <View style={styles.sheetContent}>
          <View style={styles.sheetHandle} />
          
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Notifications🔔</Text>
            <TouchableOpacity style={styles.btnClose} onPress={handleCloseSheet}>
              <X color="#64748B" size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
            {activeAlerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Heart size={36} color="#9BB3C9" strokeWidth={1.5} />
                <Text style={styles.emptyText}>All operations are nominal. No active dispatch broadcasts found.</Text>
              </View>
            ) : (
              <View>
                {/* Unread Section */}
                {unreadAlerts.length > 0 && (
                  <View>
                    <Text style={styles.sectionDividerText}>New Updates</Text>
                    {unreadAlerts.map((incident) => renderAlertCard(incident, true))}
                  </View>
                )}

                {/* Read Section */}
                {readAlerts.length > 0 && (
                  <View style={styles.readSectionSpacing}>
                    <Text style={styles.sectionDividerText}>Earlier Reviewed</Text>
                    {readAlerts.map((incident) => renderAlertCard(incident, false))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: "rgba(15,23,42,0.4)", justifyContent: "flex-end" },
  dismissDismissLayer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  sheetContent: { backgroundColor: "#fff", borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: "82%", paddingHorizontal: 20, paddingTop: 12 },
  sheetHandle: { width: 36, height: 5, backgroundColor: "#E2E8F0", borderRadius: 3, alignSelf: "center", marginBottom: 14 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: "#1D2D44" },
  btnClose: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  scrollList: { paddingBottom: 40 },
  emptyState: { paddingVertical: 60, alignItems: "center", gap: 12 },
  emptyText: { color: "#64748B", fontSize: 13, fontWeight: "500", textAlign: "center", paddingHorizontal: 30, lineHeight: 18 },
  cardContainer: { marginBottom: 14 },
  row: { flexDirection: "row", gap: 12 },
  textBlock: { flex: 1, gap: 3 },
  bold: { fontWeight: "700" },
  metaRow: { marginTop: 6, gap: 2 },
  
  // New Sage Green Palette
  dispatchCard: { backgroundColor: "#F4F9F6", borderWidth: 1, borderColor: "#D2E6DE", borderRadius: 20, padding: 16 },
  reviewedCard: { backgroundColor: "#F0F9F4", borderWidth: 1, borderColor: "#B8DCC9", borderRadius: 20, padding: 16 },
  iconCircleCalm: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E3EFEA", alignItems: "center", justifyContent: "center" },
  alertHeading: { fontSize: 15, fontWeight: "800", color: "#2E654C" },
  messageOfHope: { fontSize: 13, color: "#477E64", fontWeight: "600", lineHeight: 18 },
  metaLabel: { fontSize: 12, color: "#2E654C" },
  etaIndicator: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, backgroundColor: "#E3EFEA", padding: 10, borderRadius: 10 },
  etaText: { fontSize: 12, fontWeight: "700", color: "#2E654C" },

  // Billing & Reviews
  iconCircleRed: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" },
  billingCard: { backgroundColor: "#FFF5F5", borderWidth: 1, borderColor: "#FEE2E2", borderRadius: 20, padding: 16 },
  billingHeading: { fontSize: 15, fontWeight: "800", color: "#991B1B" },
  billingSub: { fontSize: 13, color: "#991B1B", lineHeight: 18 },
  ratingBox: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderColor: "#FEE2E2" },
  ratingTitle: { fontSize: 12, fontWeight: "700", color: "#7F1D1D", textTransform: "uppercase" },
  starRow: { flexDirection: "row", gap: 6, marginVertical: 10 },
  textInput: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#FCA5A5", borderRadius: 10, padding: 10, fontSize: 13, color: "#1D2D44", marginBottom: 12 },
  btnSubmit: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#D62828", paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  // Categorization & Split Views
  sectionDividerText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: "#94A3B8", letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  readCardSubtle: { opacity: 0.6 },
  readSectionSpacing: { marginTop: 12 },
  headerBadgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  readBadge: { backgroundColor: "#E2E8F0", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  readBadgeText: { fontSize: 9, fontWeight: "700", color: "#64748B" }
});