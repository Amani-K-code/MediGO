import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import { LayoutDashboard, Radio, ShieldCheck, Ambulance, User, AlertCircle, ChevronRight, Bell } from "lucide-react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import MapView, { Marker } from "react-native-maps";
import RequestsScreen from "./requests";
import Profile from "./profile";

const { height } = Dimensions.get("window");

export default function MedicDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [citizens, setCitizens] = useState([]);
  const [medics, setMedics] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState("emergency");
  const [autoOpenRequestId, setAutoOpenRequestId] = useState(null);

  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const citizensList = [];
      const medicsList = [];
      const ambulancesList = [];

      snapshot.forEach((doc) => {
        const user = { id: doc.id, ...doc.data() };
        if (user.role === "citizen") citizensList.push(user);
        else if (user.role === "medic") medicsList.push(user);
        else if (user.role === "ambulance") ambulancesList.push(user);
      });

      setCitizens(citizensList);
      setMedics(medicsList);
      setAmbulances(ambulancesList);
    });

    return () => unsubscribeUsers();
  }, []);

  useEffect(() => {
    const unsubscribeRequests = onSnapshot(collection(db, "requests"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setRequests(list);
    });

    return () => unsubscribeRequests();
  }, []);

  const emergencyRequests = requests.filter((req) => req.type === "emergency" && req.status !== "completed");
  const standbyRequests = requests.filter((req) => req.type === "standby" && req.status !== "completed");
  const currentFilteredRequests = requestFilter === "emergency" ? emergencyRequests : standbyRequests;

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        
        {/* HOME TAB */}
        {activeTab === "home" && (
          <View style={{ flex: 1 }}>
            <MapView
              style={styles.baseMap}
              initialRegion={{
                latitude: -1.286389,
                longitude: 36.817223,
                latitudeDelta: 0.2,
                longitudeDelta: 0.2,
              }}
              moveOnMarkerPress={false}
            >
              {citizens.map((c) => (
                <Marker key={c.id} coordinate={{ latitude: Number(c.latitude) || -1.286389, longitude: Number(c.longitude) || 36.817223 }} pinColor="red" title={c.fullName || "Citizen"} />
              ))}
              {medics.map((m) => (
                <Marker key={m.id} coordinate={{ latitude: Number(m.latitude) || -1.286389, longitude: Number(m.longitude) || 36.817223 }} pinColor="blue" title={m.fullName || "Medic"} />
              ))}
              {ambulances.map((a) => (
                <Marker key={a.id} coordinate={{ latitude: Number(a.latitude) || -1.286389, longitude: Number(a.longitude) || 36.817223 }} pinColor="green" title={a.fullName || "Ambulance Team"} />
              ))}
            </MapView>

            {/* Floating Glass Header */}
            <View style={styles.floatingHeader}>
              <View style={styles.glassPill}>
                <View style={styles.glassPillLeft}>
                  <View style={styles.glassIconDot}>
                    <ShieldCheck color="#0057B8" size={16} />
                  </View>
                  <View>
                    <Text style={styles.glassPillTitle}>MediGo EMS</Text>
                    <Text style={styles.glassPillSub}>Central Terminal</Text>
                  </View>
                </View>
                <View style={styles.onlineBadge}>
                  <View style={styles.greenPulse} />
                  <Text style={styles.onlineText}>Live</Text>
                </View>
              </View>
            </View>

            {/* Metrics Caps */}
            <View style={styles.metricRow}>
              <View style={styles.metricCardGlass}>
                <Radio color="#D62828" size={20} />
                <Text style={styles.metricNum}>{emergencyRequests.length}</Text>
                <Text style={styles.metricLabel}>Emergency</Text>
              </View>
              <View style={styles.metricCardGlass}>
                <Ambulance color="#0057B8" size={20} />
                <Text style={styles.metricNum}>{ambulances.length}</Text>
                <Text style={styles.metricLabel}>Fleet Units</Text>
              </View>
            </View>

            {/* Sliding Queue Panel */}
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeaderRow}>
                <Text style={styles.sheetTitle}>Priority Triage Queue</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity style={[styles.toggleBtn, requestFilter === "emergency" && styles.toggleBtnActive]} onPress={() => setRequestFilter("emergency")}>
                    <Text style={[styles.toggleBtnText, requestFilter === "emergency" && styles.toggleBtnTextActive]}>Emergency</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.toggleBtn, requestFilter === "standby" && styles.toggleBtnActive]} onPress={() => setRequestFilter("standby")}>
                    <Text style={[styles.toggleBtnText, requestFilter === "standby" && styles.toggleBtnTextActive]}>Standby</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 180, marginTop: 10 }}>
                {currentFilteredRequests.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>Queue completely clear.</Text>
                  </View>
                ) : (
                  currentFilteredRequests.map((req) => (
                    <View key={req.id} style={styles.incidentCard}>
                      <View style={styles.cardHeaderSide}>
                        <View style={[styles.alertIconBox, req.type === "standby" && { backgroundColor: "#FFF3E0" }]}>
                          <AlertCircle color={req.type === "emergency" ? "#D62828" : "#FF9F1C"} size={18} />
                        </View>
                        <View style={{ marginLeft: 12 }}>
                          <Text style={styles.incidentCitizen}>{req.userName || "Citizen"}</Text>
                          <Text style={styles.incidentType}>{req.type.toUpperCase()} • {req.status}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.actionDispatchBtn}
                        onPress={() => {
                          setAutoOpenRequestId(req.id);
                          setActiveTab("requests");
                        }}
                      >
                        <Text style={styles.dispatchText}>Dispatch</Text>
                        <ChevronRight color="white" size={14} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        )}

        {/* REQUESTS FEED TAB */}
        {activeTab === "requests" && (
          <RequestsScreen 
            autoTriggerRequestId={autoOpenRequestId} 
            clearAutoTrigger={() => setAutoOpenRequestId(null)} 
          />
        )}

        {activeTab === "ambulances" && (
          <View style={styles.scroller}>
            <Text style={styles.screenHeader}>Fleet Trackers</Text>
          </View>
        )}

        {activeTab === "profile" && <Profile />}
      </View>

      {/* Glossy Tab Dock */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("home")}>
            <View style={[styles.tabIconWrap, activeTab === "home" && styles.tabIconWrapActive]}>
              <LayoutDashboard color={activeTab === "home" ? "#fff" : "#9BB3C9"} size={20} />
            </View>
            <Text style={[styles.tabLabel, { color: activeTab === "home" ? "#0057B8" : "#9BB3C9" }]}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("requests")}>
            <View style={[styles.tabIconWrap, activeTab === "requests" && styles.tabIconWrapActive]}>
              <Radio color={activeTab === "requests" ? "#fff" : "#9BB3C9"} size={20} />
            </View>
            <Text style={[styles.tabLabel, { color: activeTab === "requests" ? "#0057B8" : "#9BB3C9" }]}>Requests</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("ambulances")}>
            <View style={[styles.tabIconWrap, activeTab === "ambulances" && styles.tabIconWrapActive]}>
              <Ambulance color={activeTab === "ambulances" ? "#fff" : "#9BB3C9"} size={20} />
            </View>
            <Text style={[styles.tabLabel, { color: activeTab === "ambulances" ? "#0057B8" : "#9BB3C9" }]}>Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("profile")}>
            <View style={[styles.tabIconWrap, activeTab === "profile" && styles.tabIconWrapActive]}>
              <User color={activeTab === "profile" ? "#fff" : "#9BB3C9"} size={20} />
            </View>
            <Text style={[styles.tabLabel, { color: activeTab === "profile" ? "#0057B8" : "#9BB3C9" }]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F9FD" },
  mainContent: { flex: 1 },
  baseMap: { width: "100%", height: height },
  floatingHeader: { position: "absolute", top: 50, left: 18, right: 18, zIndex: 15 },
  glassPill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.95)", padding: 12, borderRadius: 20, elevation: 4 },
  glassPillLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  glassIconDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#E6F4FE", justifyContent: "center", alignItems: "center", marginRight: 8 },
  glassPillTitle: { fontSize: 14, fontWeight: "800", color: "#1D2D44" },
  glassPillSub: { fontSize: 11, color: "#64748B" },
  onlineBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#E6F4EA", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  greenPulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#2A9D8F", marginRight: 4 },
  onlineText: { fontSize: 11, fontWeight: "700", color: "#137333" },
  metricRow: { position: "absolute", top: 124, left: 18, right: 18, flexDirection: "row", gap: 12, zIndex: 14 },
  metricCardGlass: { flex: 1, backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 16, padding: 14, elevation: 3 },
  metricNum: { fontSize: 20, fontWeight: "800", color: "#1D2D44", marginVertical: 2 },
  metricLabel: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  bottomSheet: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 110, elevation: 10 },
  sheetHandle: { width: 36, height: 4, backgroundColor: "#E2E8F0", borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  sheetHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  sheetTitle: { fontSize: 16, fontWeight: "800", color: "#1D2D44" },
  toggleContainer: { flexDirection: "row", backgroundColor: "#EDF2F7", borderRadius: 10, padding: 2 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  toggleBtnActive: { backgroundColor: "#fff" },
  toggleBtnText: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  toggleBtnTextActive: { color: "#0057B8", fontWeight: "700" },
  incidentCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  cardHeaderSide: { flexDirection: "row", alignItems: "center" },
  alertIconBox: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#FCE8E6", justifyContent: "center", alignItems: "center" },
  incidentCitizen: { fontWeight: "700", fontSize: 14, color: "#1D2D44" },
  incidentType: { fontSize: 11, color: "#64748B", marginTop: 1 },
  actionDispatchBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#0057B8", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 4 },
  dispatchText: { color: "white", fontSize: 12, fontWeight: "700" },
  scroller: { flex: 1, padding: 20, paddingTop: 60 },
  screenHeader: { fontSize: 22, fontWeight: "800", color: "#0057B8" },
  tabBarWrapper: { position: "absolute", bottom: 20, left: 16, right: 16, zIndex: 25 },
  tabBar: { height: 64, backgroundColor: "#fff", flexDirection: "row", borderRadius: 24, elevation: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabIconWrap: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  tabIconWrapActive: { backgroundColor: "#0057B8" },
  tabLabel: { fontSize: 10, fontWeight: "700", marginTop: 2 },
  emptyState: { padding: 20, alignItems: "center" },
  emptyStateText: { color: "#94A3B8", fontSize: 12 },
});