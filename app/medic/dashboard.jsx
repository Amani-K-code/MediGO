import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { LayoutDashboard, Radio, ShieldCheck, Ambulance, User, AlertCircle, ChevronRight, Activity } from "lucide-react-native";

export default function MedicDashboard() {
  const [activeTab, setActiveTab] = useState("home");

  // Mock Active Requests matching database document structures
  const activeRequests = [
    { id: "101", citizen: "John Doe", type: "Critical Trauma", time: "2 mins ago", loc: "Sector 4 Block B" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        
        {activeTab === "home" && (
          <ScrollView style={styles.scroller} showsVerticalScrollIndicator={false}>
            {/* Header Identity Bar */}
            <View style={styles.headerBar}>
              <View>
                <Text style={styles.appTitle}>MediGo EMS</Text>
                <Text style={styles.operatorSubtitle}>Central Facility Terminal</Text>
              </View>
              <View style={styles.onlineBadge}>
                <View style={styles.greenPulse} />
                <Text style={styles.onlineText}>Live Stream</Text>
              </View>
            </View>

            {/* Verification Flag Row */}
            <View style={styles.verificationBanner}>
              <ShieldCheck color="#2A9D8F" size={22} />
              <Text style={styles.bannerText}>Facility Credentials Verified & Active</Text>
            </View>

            {/* Metrics Matrix Block */}
            <View style={styles.gridContainer}>
              <View style={styles.metricCard}>
                <Radio color="#D62828" size={24} />
                <Text style={styles.metricNum}>{activeRequests.length}</Text>
                <Text style={styles.metricLabel}>Pending Alerts</Text>
              </View>
              <View style={styles.metricCard}>
                <Ambulance color="#0057B8" size={24} />
                <Text style={styles.metricNum}>3 / 5</Text>
                <Text style={styles.metricLabel}>Ambulances Available</Text>
              </View>
            </View>

            {/* Live Feed Teaser Section */}
            <Text style={styles.sectionHeading}>Immediate Priority Queue</Text>
            {activeRequests.map((req) => (
              <View key={req.id} style={styles.incidentCard}>
                <View style={styles.cardHeaderSide}>
                  <AlertCircle color="#D62828" size={20} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.incidentCitizen}>{req.citizen} — ID #{req.id}</Text>
                    <Text style={styles.incidentType}>{req.type} ({req.loc})</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.actionDispatchBtn}>
                  <Text style={styles.dispatchText}>Dispatch</Text>
                  <ChevronRight color="white" size={14} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {activeTab === "requests" && (
          <ScrollView style={styles.scroller}>
            <Text style={styles.screenHeader}>Incoming Distress Pipeline</Text>
            <Text style={styles.screenSub}>Real-time requests waiting for asset confirmation hooks.</Text>
            {activeRequests.map((req) => (
              <View key={req.id} style={styles.bigIncidentBox}>
                <View style={styles.incidentHeader}>
                  <Activity color="#D62828" size={18} />
                  <Text style={styles.timeTag}>{req.time}</Text>
                </View>
                <Text style={styles.bigBoxTitle}>{req.citizen}</Text>
                <Text style={styles.bigBoxBody}>Reported incident type is classified under severe {req.type}. Location coordinates stored inside Firestore payload document array.</Text>
                <TouchableOpacity style={styles.fullWidthAccept}>
                  <Text style={styles.fullAcceptText}>Accept & Route Vehicle</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {activeTab === "ambulances" && (
          <ScrollView style={styles.scroller}>
            <Text style={styles.screenHeader}>Ambulance Registry</Text>
            <Text style={styles.screenSub}>Manage physical telemetry status and vehicle plates.</Text>
            <View style={styles.fleetCard}>
              <Text style={styles.plateText}>🚑 KBX 412Z — Available</Text>
              <Text style={styles.fleetDetail}>Model: Toyota HiAce Responder • Driver Sync Active</Text>
            </View>
          </ScrollView>
        )}

        {activeTab === "profile" && (
          <ScrollView style={styles.scroller}>
            <Text style={styles.screenHeader}>Facility Information</Text>
            <View style={styles.fleetCard}>
              <User color="#0057B8" size={20} />
              <Text style={styles.plateText}>Athi River Emergency Base</Text>
              <Text style={styles.fleetDetail}>Lic ID: MED-88219-NMS</Text>
            </View>
          </ScrollView>
        )}
      </View>

      {/* 2. Structured Tab Bar Assembly */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("home")}>
          <LayoutDashboard color={activeTab === "home" ? "#0057B8" : "#7A9FB8"} size={22} />
          <Text style={[styles.tabLabel, { color: activeTab === "home" ? "#0057B8" : "#7A9FB8" }]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("requests")}>
          <Radio color={activeTab === "requests" ? "#0057B8" : "#7A9FB8"} size={22} />
          <Text style={[styles.tabLabel, { color: activeTab === "requests" ? "#0057B8" : "#7A9FB8" }]}>Requests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("ambulances")}>
          <Ambulance color={activeTab === "ambulances" ? "#0057B8" : "#7A9FB8"} size={22} />
          <Text style={[styles.tabLabel, { color: activeTab === "ambulances" ? "#0057B8" : "#7A9FB8" }]}>Fleet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("profile")}>
          <User color={activeTab === "profile" ? "#0057B8" : "#7A9FB8"} size={22} />
          <Text style={[styles.tabLabel, { color: activeTab === "profile" ? "#0057B8" : "#7A9FB8" }]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  mainContent: { flex: 1 },
  scroller: { flex: 1, padding: 20, paddingTop: 50 },
  headerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  appTitle: { fontSize: 26, fontWeight: "800", color: "#1D2D44" },
  operatorSubtitle: { fontSize: 13, color: "#64748B", marginTop: 2 },
  onlineBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#E6F4FE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  greenPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2A9D8F", marginRight: 6 },
  onlineText: { fontSize: 11, fontWeight: "700", color: "#0057B8" },
  verificationBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#E8F6F3", padding: 14, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: "#A2D9CE" },
  bannerText: { marginLeft: 10, color: "#116B5E", fontWeight: "600", fontSize: 13 },
  gridContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  metricCard: { width: "47%", backgroundColor: "white", padding: 16, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  metricNum: { fontSize: 24, fontWeight: "800", color: "#1D2D44", marginVertical: 6 },
  metricLabel: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  sectionHeading: { fontSize: 16, fontWeight: "700", color: "#1D2D44", marginBottom: 12 },
  incidentCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: 14, borderRadius: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, marginBottom: 10 },
  cardHeaderSide: { flexDirection: "row", alignItems: "center" },
  incidentCitizen: { fontWeight: "700", fontSize: 14, color: "#1D2D44" },
  incidentType: { fontSize: 12, color: "#D62828", fontWeight: "500", marginTop: 2 },
  actionDispatchBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#0057B8", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  dispatchText: { color: "white", fontSize: 12, fontWeight: "700", marginRight: 4 },
  screenHeader: { fontSize: 22, fontWeight: "800", color: "#1D2D44", marginBottom: 4 },
  screenSub: { fontSize: 13, color: "#64748B", marginBottom: 20 },
  bigIncidentBox: { backgroundColor: "white", padding: 16, borderRadius: 22, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  incidentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  timeTag: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  bigBoxTitle: { fontSize: 18, fontWeight: "700", color: "#1D2D44", marginBottom: 6 },
  bigBoxBody: { fontSize: 13, color: "#475569", lineHeight: 18, marginBottom: 15 },
  fullWidthAccept: { backgroundColor: "#2A9D8F", width: "100%", padding: 14, borderRadius: 14, alignItems: "center" },
  fullAcceptText: { color: "white", fontWeight: "700", fontSize: 14 },
  fleetCard: { backgroundColor: "white", padding: 16, borderRadius: 18, marginBottom: 10 },
  plateText: { fontWeight: "700", fontSize: 15, color: "#1D2D44" },
  fleetDetail: { fontSize: 12, color: "#64748B", marginTop: 4 },
  tabBar: { height: 70, backgroundColor: "white", flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingBottom: 10 },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabLabel: { fontSize: 10, fontWeight: "600", marginTop: 4 },
});