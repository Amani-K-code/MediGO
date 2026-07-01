import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet, TextInput } from "react-native";
import { Home, HeartPulse, Ambulance, User, Settings, ShieldAlert, MapPin, Search, Navigation, Bell, ChevronRight, Clock, MessageSquare, X } from "lucide-react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { addDoc,serverTimestamp,collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { Alert } from "react-native";
import NotificationsSheet from "./notifications";
import AmbulanceHotlines from "./ambulanceHotlines";
import { triggerSMSFallback } from "../services/smsService";
import FirstAid from "./firstAid";


const { width, height } = Dimensions.get("window");

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [medics, setMedics] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  

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

  // Live filter across the medics already fetched — no static data, queries real Firestore results
  const filteredMedics = medics.filter((medic) => {
    if (!searchQuery.trim()) return true;
    const haystack = `${medic.establishmentName || ""} ${medic.providerType || ""}`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  const sendEmergencyRequest = async () => {
    try{
      const user = getAuth().currentUser;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      const userData = userDoc.data();

      await addDoc(collection(db, "requests"), {
        userId: user.uid,
        userName: userData.fullName,
        type: "emergency",
        latitude: -1.286389, // Placeholder for actual user location
        longitude: 36.817223, // Placeholder for actual user location
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Emergency Request Sent", "Help is on the way!");

    } catch (error) {
      console.error("Error sending emergency request: ", error);
      Alert.alert("Failed to send request", "Please try again.");
    }
  };

  const sendStandbyRequest = async () => {
    try {

      const user = getAuth().currentUser;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      const userData = userDoc.data();

      await addDoc(collection(db, "requests"), {
        userId: user.uid,
        userName: userData.fullName,
        type: "standby",
        latitude: -1.286389, // Placeholder for actual user location
        longitude: 36.817223, // Placeholder for actual user location
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Standby Request Sent", "Medical team will be on standby.");

    } catch (error) {
      console.error("Error sending standby request: ", error);
      Alert.alert("Failed to send request", "Please try again.");
    }
  };

  const [myRequests, setMyRequests] = useState([]);
  useEffect(() => {
    const user = getAuth().currentUser;

    if(!user) return;

    const q = query(
      collection(db, "requests"),
      where("status", "==", "pending"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsData = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setMyRequests(requestsData);
    });

    return () => unsubscribe();
  }, []);

  // Listen for active stream events to update the notifications bay
  useEffect(() => {
    const user = getAuth().currentUser;
    if(!user) return;

    const q = query(
      collection(db, "requests"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, (snapShot) => {
      let unread = 0;
      snapShot.forEach((doc) => {
        const data = doc.data();
        if(data.status === "dispatched" || (data.status === "completed" && data.paymentPending === true)) {
          unread++;
        }
      });
      setUnreadCount(unread);
    }, (error) => {
      console.error("Error listening to live stream updates: ", error);
    });

    return () => unsubscribe();
  }, []);

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
              moveOnMarkerPress={false}
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

            {/* Floating Glass Header — now with functional search */}
            <View style={styles.floatingHeader} pointerEvents="box-none">
              {!isSearchOpen ? (
                <View style={styles.glassPill}>
                  <View style={styles.glassPillLeft}>
                    <View style={styles.glassIconDot}>
                      <MapPin color="#0057B8" size={16} />
                    </View>
                    <Text style={styles.glassPillText} numberOfLines={1}>MediGo</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.glassBellBtn}
                    activeOpacity={0.7}
                    onPress={() => setIsSearchOpen(true)}
                  >
                    <Search color="#1D2D44" size={17} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.glassBellBtn} activeOpacity={0.7} onPress={() => setIsNotificationsOpen(true)}>
                    <Bell color="#1D2D44" size={18} />
                    {unreadCount > 0 && <View style={styles.badgeDot} />}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.searchPill}>
                  <Search color="#0057B8" size={17} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search medics or ambulance teams..."
                    placeholderTextColor="#9BB3C9"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    activeOpacity={0.7}
                  >
                    <X color="#9BB3C9" size={18} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Absolute High-Contrast SOS + Standby Distress Assembly */}
            <View style={styles.sosWrapper} pointerEvents="box-none">
              <View style={styles.sosRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.sosButton}
                  onPress={sendEmergencyRequest}
                  >
                  <View style={styles.sosGlossHighlight} />
                  <ShieldAlert color="white" size={34} strokeWidth={2.2} />
                  <Text style={styles.sosText}>SOS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.standbyButton}
                  onPress={sendStandbyRequest}
                >
                  <View style={styles.standbyGlossHighlight} />
                  <Clock color="white" size={32} strokeWidth={2.2} />
                  <Text style={styles.standbyButtonText}>Standby</Text>
                </TouchableOpacity>
              </View>

              {/* Functional Dashboard Floating Emergency broadcast button */}
              <TouchableOpacity 
                style={styles.smsHintBtn} 
                activeOpacity={0.75}
                onPress={() => {
                  // Grabs first available medical unit phone record or falls back to system dispatch numbers
                  const primaryResponder = medics[0]?.phone || "999"; 
                  triggerSMSFallback(primaryResponder);
                }}
              >
                <MessageSquare color="#0057B8" size={14} strokeWidth={2.3} />
                <Text style={styles.smsHintText}>Tap for Emergency SMS Dispatch</Text>
              </TouchableOpacity>
            </View>

            {/* Sliding Bottom Information Sheet Layer */}
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetTitle}>Facilities Near You</Text>
                  <Text style={styles.sheetCount}>
                    {filteredMedics.length} facilit{filteredMedics.length === 1 ? "y" : "ies"} found
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.searchBarSim}
                  activeOpacity={0.7}
                  onPress={() => setIsSearchOpen(true)}
                >
                  <Search color="#0057B8" size={16} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 230 }}>
                {filteredMedics.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ambulance color="#B9CCE0" size={28} />
                    <Text style={styles.emptyStateText}>
                      {searchQuery ? "No matching facilities found" : "No facilities found nearby yet"}
                    </Text>
                  </View>
                ) : (
                  filteredMedics.map((medic) => (
                    <TouchableOpacity key={medic.id} style={styles.facilityCard} activeOpacity={0.85}>
                      <View style={styles.cardLeft}>
                        <View style={styles.iconCircle}>
                          <View style={styles.iconCircleGloss} />
                          <Ambulance color="#0057B8" size={20} strokeWidth={2.2} />
                        </View>

                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={styles.facilityName} numberOfLines={1}>
                            {medic.establishmentName}
                          </Text>

                          <View style={styles.facilityTagRow}>
                            <View style={styles.facilityTagPill}>
                              <Text style={styles.facilityTagPillText}>
                                {medic.providerType || "Verified"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View style={styles.cardRightBtn}>
                        <ChevronRight color="#0057B8" size={18} strokeWidth={2.4} />
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        )}

        {/* First Aid tab — heading only, no static data */}
        {activeTab === "first_aid" && (
        <View style={{ flex: 1, paddingTop: 50 }}> 
          <FirstAid />
        </View>
      )}

        {/* Ambulances tab — Rendering Dynamic fleet data */}
        {activeTab === "ambulances" && (
          <View style={styles.scroller}>
            <AmbulanceHotlines />
          </View>
        )}

        {/* Profile tab — heading only, no static data */}
        {activeTab === "profile" && (
          <View style={styles.scroller}>
            <Text style={styles.screenHeader}>User Profile & Settings</Text>
          </View>
        )}
      </View>

      {/* 2. Structured Tab Bar Assembly — floating glossy dock */}
      <View style={styles.tabBarWrapper} pointerEvents="box-none">
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("home")} activeOpacity={0.7}>
            <View style={[styles.tabIconWrap, activeTab === "home" && styles.tabIconWrapActive]}>
              <Home color={activeTab === "home" ? "#FFFFFF" : "#9BB3C9"} size={20} strokeWidth={2.3} />
            </View>
            <Text style={[styles.tabLabel, { color: activeTab === "home" ? "#0057B8" : "#9BB3C9" }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("first_aid")} activeOpacity={0.7}>
            <View style={[styles.tabIconWrap, activeTab === "first_aid" && styles.tabIconWrapActive]}>
              <HeartPulse color={activeTab === "first_aid" ? "#FFFFFF" : "#9BB3C9"} size={20} strokeWidth={2.3} />
            </View>
            <Text style={[styles.tabLabel, { color: activeTab === "first_aid" ? "#0057B8" : "#9BB3C9" }]}>First Aid</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("ambulances")} activeOpacity={0.7}>
            <View style={[styles.tabIconWrap, activeTab === "ambulances" && styles.tabIconWrapActive]}>
              <Ambulance color={activeTab === "ambulances" ? "#FFFFFF" : "#9BB3C9"} size={20} strokeWidth={2.3} />
            </View>
            <Text style={[styles.tabLabel, { color: activeTab === "ambulances" ? "#0057B8" : "#9BB3C9" }]}>Ambulance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab("profile")} activeOpacity={0.7}>
            <View style={[styles.tabIconWrap, activeTab === "profile" && styles.tabIconWrapActive]}>
              <User color={activeTab === "profile" ? "#FFFFFF" : "#9BB3C9"} size={20} strokeWidth={2.3} />
            </View>
            <Text style={[styles.tabLabel, { color: activeTab === "profile" ? "#0057B8" : "#9BB3C9" }]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/**Notification Sheet Overlay */}
      <NotificationsSheet 
      isOpen={isNotificationsOpen} 
      onClose={() => setIsNotificationsOpen(false)} 
      />
    </View>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6F4FE" },
  mainContent: { flex: 1 },
  mockMap: { width: "100%", height: height, backgroundColor: "#DCE9F5" },

  // Floating glass header
  floatingHeader: { position: "absolute", top: 56, left: 18, right: 18, zIndex: 15 },
  glassPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.82)",
    paddingVertical: 10,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#1D2D44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
    gap: 8,
  },
  glassPillLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  glassIconDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EAF3FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  glassPillText: { fontSize: 16, fontWeight: "800", color: "#0057B8", letterSpacing: 0.2 },
  glassBellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF3F9",
    position: "relative",
  },
  badgeDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D62828",
  },

  // Functional search pill (replaces header when search opens)

  // Functional search pill (replaces header when search opens)
  searchPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#1D2D44",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1D2D44",
    fontWeight: "500",
  },

  // SOS + Standby floating assembly — equal-sized circular pair
  sosWrapper: { position: "absolute", top: height * 0.32, left: 0, right: 0, alignItems: "center", zIndex: 20 },
  sosRow: { flexDirection: "row", alignItems: "center", gap: 22 },
  sosButton: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#D62828",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9D1D1D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.55)",
    overflow: "hidden",
  },
  sosGlossHighlight: {
    position: "absolute",
    top: -18,
    left: -8,
    width: 130,
    height: 64,
    borderRadius: 64,
    backgroundColor: "rgba(255,255,255,0.18)",
    transform: [{ rotate: "-10deg" }],
  },
  sosText: { color: "white", fontSize: 19, fontWeight: "900", letterSpacing: 1.3, marginTop: 2 },

  standbyButton: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#F4A261",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C97A35",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.55)",
    overflow: "hidden",
  },
  standbyGlossHighlight: {
    position: "absolute",
    top: -18,
    left: -8,
    width: 130,
    height: 64,
    borderRadius: 64,
    backgroundColor: "rgba(255,255,255,0.2)",
    transform: [{ rotate: "-10deg" }],
  },
  standbyButtonText: { color: "white", fontSize: 13, fontWeight: "800", letterSpacing: 0.6, marginTop: 4 },

  // Icon-only SMS fallback hint — no body text caption anymore
  smsHintBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginTop: 14,
    gap: 6,
    shadowColor: "#1D2D44",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  smsHintText: { fontSize: 11, fontWeight: "700", color: "#0057B8" },

  // Bottom sheet
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 130,
    shadowColor: "#1D2D44",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetHandle: { width: 40, height: 5, backgroundColor: "#E0E6ED", borderRadius: 3, alignSelf: "center", marginBottom: 16 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: "#1D2D44" },
  sheetCount: { fontSize: 12, color: "#8A9BAE", marginTop: 2, fontWeight: "500" },
  searchBarSim: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EAF3FD",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 30, gap: 10 },
  emptyStateText: { fontSize: 13, color: "#9BB3C9", fontWeight: "500" },

  facilityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FBFE",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EDF2F8",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E6F4FE",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  iconCircleGloss: {
    position: "absolute",
    top: -8,
    left: -4,
    width: 50,
    height: 26,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.5)",
    transform: [{ rotate: "-8deg" }],
  },
  facilityName: { fontWeight: "700", fontSize: 14.5, color: "#1D2D44" },
  facilityTagRow: { flexDirection: "row", marginTop: 5 },
  facilityTagPill: {
    backgroundColor: "#E6F4FE",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  facilityTagPillText: { fontSize: 10.5, color: "#0057B8", fontWeight: "700" },
  cardRightBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#E6F4FE",
  },

  // Generic screens — heading only, no static data
  scroller: { flex: 1, padding: 20, paddingTop: 60 },
  screenHeader: { fontSize: 24, fontWeight: "800", color: "#0057B8", marginBottom: 5 },

  // Floating glossy tab bar / dock
  tabBarWrapper: {
    position: "absolute",
    bottom: 22,
    left: 18,
    right: 18,
    zIndex: 25,
  },
  tabBar: {
    height: 68,
    backgroundColor: "rgba(255,255,255,0.95)",
    flexDirection: "row",
    borderRadius: 30,
    paddingHorizontal: 6,
    shadowColor: "#1D2D44",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
  },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center", gap: 3 },
  tabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIconWrapActive: {
    backgroundColor: "#0057B8",
    shadowColor: "#0057B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  tabLabel: { fontSize: 10.5, fontWeight: "700" },
});