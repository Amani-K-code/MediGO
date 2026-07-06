import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { Ambulance, Star, CreditCard, CheckCircle, Clock, Heart, X, Trash2 } from "lucide-react-native";
import { listenToLiveStreamUpdates, sendReviewFeedbackScore } from "../services/notificationService";

export default function NotificationsSheet({ isOpen, onClose }) {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);
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

  // Only truly "actionable" cards (payment pending, not yet reviewed) are protected from auto-clear.
  // Everything else (dispatched-in-transit, already-reviewed) is safe to permanently clear once seen.
  const isActionRequired = (incident) => {
    const needsPayment = incident.status === "completed" || incident.status === "pending_payment" || incident.paymentPending === true;
    const alreadyReviewed = incident.rating != null;
    return needsPayment && !alreadyReviewed;
  };

  // On close: permanently dismiss everything currently visible that doesn't still need action
  const handleCloseSheet = () => {
    const clearableIds = activeAlerts
      .filter((alert) => !isActionRequired(alert))
      .map((alert) => alert.id);

    if (clearableIds.length > 0) {
      setDismissedIds((prev) => Array.from(new Set([...prev, ...clearableIds])));
    }
    onClose();
  };

  // Explicit "Clear All" — dismisses everything currently visible, no exceptions
  const handleClearAll = () => {
    const allIds = activeAlerts.map((alert) => alert.id);
    setDismissedIds((prev) => Array.from(new Set([...prev, ...allIds])));
  };

  const handleReviewSubmission = async (requestId) => {
    const response = await sendReviewFeedbackScore(requestId, rating, reviewText);
    if (response.success) {
      Alert.alert("Thank you", "Your feedback is highly appreciated.");
      setRating(0);
      setReviewText("");
      // Once reviewed, this card no longer needs action — safe to clear immediately
      setDismissedIds((prev) => Array.from(new Set([...prev, requestId])));
    } else {
      Alert.alert("Error", "Failed to submit review. Please contact support.");
    }
  };

  // Filter out anything already dismissed — this is what actually removes clutter
  const visibleAlerts = activeAlerts.filter((alert) => !dismissedIds.includes(alert.id));

  const renderAlertCard = (incident) => (
    <View key={incident.id} style={styles.cardContainer}>
      {/* CASE C: Already reviewed — show confirmation instead of form */}
      {incident.rating != null && incident.status === "completed" && (
        <View style={styles.reviewedCard}>
          <View style={styles.row}>
            <View style={styles.iconCircleCalm}>
              <CheckCircle color="#2E654C" size={20} />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.alertHeading}>Review Submitted</Text>
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
              <Text style={styles.alertHeading}>Fleet En-Route</Text>
              <Text style={styles.messageOfHope}>Hold on, professional care is rushing to your location. Keep calm.</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Ambulance Driver Name: <Text style={styles.bold}>{incident.driverName}</Text></Text>
                <Text style={styles.metaLabel}>Number Plate: <Text style={styles.bold}>{incident.plateNumber}</Text></Text>
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
              <Text style={styles.billingHeading}>Payment Pending</Text>
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
            <Text style={styles.sheetTitle}>Notifications</Text>
            <View style={styles.headerActions}>
              {visibleAlerts.length > 0 && (
                <TouchableOpacity style={styles.btnClearAll} onPress={handleClearAll}>
                  <Trash2 color="#64748B" size={14} />
                  <Text style={styles.btnClearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.btnClose} onPress={handleCloseSheet}>
                <X color="#64748B" size={18} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
            {visibleAlerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Heart size={36} color="#9BB3C9" strokeWidth={1.5} />
                <Text style={styles.emptyText}>All operations are nominal. No active dispatch broadcasts found.</Text>
              </View>
            ) : (
              <View>
                {visibleAlerts.map((incident) => renderAlertCard(incident))}
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  btnClearAll: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  btnClearAllText: { fontSize: 11, fontWeight: "700", color: "#64748B" },
  btnClose: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  scrollList: { paddingBottom: 40 },
  emptyState: { paddingVertical: 60, alignItems: "center", gap: 12 },
  emptyText: { color: "#64748B", fontSize: 13, fontWeight: "500", textAlign: "center", paddingHorizontal: 30, lineHeight: 18 },
  cardContainer: { marginBottom: 14 },
  row: { flexDirection: "row", gap: 12 },
  textBlock: { flex: 1, gap: 3 },
  bold: { fontWeight: "700" },
  metaRow: { marginTop: 6, gap: 2 },

  dispatchCard: { backgroundColor: "#F4F9F6", borderWidth: 1, borderColor: "#D2E6DE", borderRadius: 20, padding: 16 },
  reviewedCard: { backgroundColor: "#F0F9F4", borderWidth: 1, borderColor: "#B8DCC9", borderRadius: 20, padding: 16 },
  iconCircleCalm: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E3EFEA", alignItems: "center", justifyContent: "center" },
  alertHeading: { fontSize: 15, fontWeight: "800", color: "#2E654C" },
  messageOfHope: { fontSize: 13, color: "#477E64", fontWeight: "600", lineHeight: 18 },
  metaLabel: { fontSize: 12, color: "#2E654C" },
  etaIndicator: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, backgroundColor: "#E3EFEA", padding: 10, borderRadius: 10 },
  etaText: { fontSize: 12, fontWeight: "700", color: "#2E654C" },

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
});