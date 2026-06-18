import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from "react-native";
import { Home, HeartPulse, Ambulance, User, Settings, ShieldAlert, MapPin, Search, Navigation } from "lucide-react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";


const { width, height } = Dimensions.get("window");

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [medics, setMedics] = useState([]);

  const fetchMedics = async () => {
    const q = query(
      collection(db, "users"),
      where("role", "==", "medic"),
      where("status", "==", "approved")
    );

    const snapshot = await getDocs(q);
    const medicList = [];

    snapshot.forEach((doc) => {
      medicList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    setMedics(medicList);
  };

  useEffect(() => {
    fetchMedics();
  }, []);


  const firstAidSkills = [
    { title: "Adult CPR", category: "Cardiac", eta: "Immediate" },
    { title: "Heimlich Maneuver", category: "Choking", eta: "Immediate" },
  ];

  return (
    <View style={styles.container}>
      {/* 1. Main Dynamic Content Container Layer */}
      <View style={styles.mainContent}>
        {activeTab === "home" && (
          <View style={{ flex: 1 }}>
            {/* Simulated Map Layer (Full bleed visual representation) */}
            <MapView
              style={styles.mockMap}
              initialRegion={{
                latitude: -1.286389,
                longitude: 36.817223,
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
              }}
            >
            {medics.map((medic) => (
              <Marker
                key={medic.id}
                coordinate={{
                  latitude: Number(medic.latitude),
                  longitude: Number(medic.longitude),
                }}
                pinColor="red"
                title={medic.establishmentName}
                description={medic.providerType}
              />
            ))}
            </MapView>


            {/* Absolute High-Contrast SOS Distress Assembly */}
            <View style={styles.sosWrapper}>
              <TouchableOpacity activeOpacity={0.8} style={styles.sosButton}>
                <ShieldAlert color="white" size={44} />
                <Text style={styles.sosText}>SOS</Text>
              </TouchableOpacity>
              <Text style={styles.sosSubtext}>Tap once to execute SMS Fail-Safe fallback</Text>
            </View>

            {/* Sliding Bottom Information Sheet Layer */}
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Healthcare Facilities Near You</Text>
                <TouchableOpacity style={styles.searchBarSim}>
                  <Search color="#666" size={16} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 220 }}>
                {medics.map((medic) => (
                  <View key={medic.id} style={styles.facilityCard}>
                    <View style={styles.cardLeft}>
                      <View style={styles.iconCircle}>
                        <Ambulance color="#0057B8" size={20} />
                      </View>

                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.facilityName}>
                          {medic.establishmentName}
                        </Text>

                        <Text style={styles.facilityTag}>
                          {medic.providerType}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {activeTab === "first_aid" && (
          <ScrollView style={styles.scroller} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.screenHeader}>First Aid Repository</Text>
            <Text style={styles.screenSub}>Offline storage active. Instructions access verified without network.</Text>
            {firstAidSkills.map((skill, index) => (
              <View key={index} style={styles.dataCard}>
                <HeartPulse color="#D62828" size={24} />
                <View style={{ marginLeft: 15, flex: 1 }}>
                  <Text style={styles.cardTitle}>{skill.title}</Text>
                  <Text style={styles.cardDetail}>Category: {skill.category} • Steps cached</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {activeTab === "ambulances" && (
          <ScrollView style={styles.scroller}>
            <Text style={styles.screenHeader}>Emergency Hotlines</Text>
            <Text style={styles.screenSub}>Direct routing to responsive ambulance dispatches.</Text>
            <View style={styles.dataCard}>
              <Ambulance color="#0057B8" size={24} />
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.cardTitle}>MediGo Fleet Alpha</Text>
                <Text style={styles.cardDetail}>Status: Active Hub • 3 Vehicles Available</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {activeTab === "profile" && (
          <ScrollView style={styles.scroller}>
            <Text style={styles.screenHeader}>User Profile & Settings</Text>
            <View style={styles.dataCard}>
              <User color="#0057B8" size={24} />
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.cardTitle}>General Citizen Account</Text>
                <Text style={styles.cardDetail}>Next of Kin verified</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* 2. Structured Tab Bar Assembly */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("home")}>
          <Home color={activeTab === "home" ? "#0057B8" : "#7A9FB8"} size={22} />
          <Text style={[styles.tabLabel, { color: activeTab === "home" ? "#0057B8" : "#7A9FB8" }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("first_aid")}>
          <HeartPulse color={activeTab === "first_aid" ? "#0057B8" : "#7A9FB8"} size={22} />
          <Text style={[styles.tabLabel, { color: activeTab === "first_aid" ? "#0057B8" : "#7A9FB8" }]}>First Aid</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("ambulances")}>
          <Ambulance color={activeTab === "ambulances" ? "#0057B8" : "#7A9FB8"} size={22} />
          <Text style={[styles.tabLabel, { color: activeTab === "ambulances" ? "#0057B8" : "#7A9FB8" }]}>Transit</Text>
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
  container: { flex: 1, backgroundColor: "#E6F4FE" },
  mainContent: { flex: 1 },
  mockMap: { width: "100%", height: height * 0.55, backgroundColor: "#CBE3F7", position: "relative" },
  mapGridLines: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderColor: "#B2D3EE", opacity: 0.4 },
  pulseDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#0057B8", position: "absolute", borderWidth: 2, borderColor: "white" },
  hospitalPin: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#D62828", justifyContent: "center", alignItems: "center", position: "absolute" },
  floatingHeader: { position: "absolute", top: 50, left: 20, right: 20, zIndex: 10 },
  locationBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 12, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  locTitle: { fontWeight: "700", fontSize: 14, color: "#1D2D44" },
  locSub: { fontSize: 11, color: "#666" },
  sosWrapper: { position: "absolute", top: height * 0.35, left: 0, right: 0, alignItems: "center", zIndex: 20 },
  sosButton: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#D62828", justifyContent: "center", alignItems: "center", borderHoverColor: "#9D1D1D", shadowColor: "#D62828", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8, borderWidth: 4, borderColor: "rgba(255,255,255,0.4)" },
  sosText: { color: "white", fontSize: 24, fontWeight: "900", letterSpacing: 1 },
  sosSubtext: { color: "#1D2D44", fontSize: 11, fontWeight: "600", marginTop: 8, backgroundColor: "rgba(230, 244, 254, 0.8)", paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  bottomSheet: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 10 },
  sheetHandle: { width: 40, height: 5, backgroundColor: "#E0E0E0", borderRadius: 3, alignSelf: "center", marginBottom: 15 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#1D2D44" },
  searchBarSim: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F0F4F8", justifyContent: "center", alignItems: "center" },
  facilityCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC", padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  cardLeft: { flexDirection: "row", alignItems: "center" },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#E6F4FE", justifyContent: "center", alignItems: "center" },
  facilityName: { fontWeight: "600", fontSize: 14, color: "#1D2D44" },
  facilityTag: { fontSize: 11, color: "#0057B8", marginTop: 2 },
  distanceText: { fontSize: 12, fontWeight: "700", color: "#64748B" },
  routeBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#0057B8", justifyContent: "center", alignItems: "center", marginTop: 4 },
  scroller: { flex: 1, padding: 20, paddingTop: 60 },
  screenHeader: { fontSize: 24, fontWeight: "800", color: "#0057B8", marginBottom: 5 },
  screenSub: { fontSize: 13, color: "#64748B", marginBottom: 20 },
  dataCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 16, borderRadius: 18, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#0057B8" },
  cardTitle: { fontWeight: "700", fontSize: 15, color: "#1D2D44" },
  cardDetail: { fontSize: 12, color: "#64748B", marginTop: 2 },
  tabBar: { height: 70, backgroundColor: "white", flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingBottom: 10 },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabLabel: { fontSize: 10, fontWeight: "600", marginTop: 4 },
});