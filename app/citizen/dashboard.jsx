import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Home, LogOut, HeartPulse, Ambulance, User, Settings, ShieldAlert, MapPin, Search, Navigation, Bell, ChevronRight, Clock, MessageSquare, X, Stethoscope } from "lucide-react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { addDoc, serverTimestamp, collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth, signOut } from "firebase/auth";
import { BackHandler, Alert } from "react-native";
import NotificationsSheet from "./notifications";
import AmbulanceHotlines from "./ambulanceHotlines";
import { triggerSMSFallback } from "../services/smsService";
import FirstAid from "./firstAid";
import Profile from "./profile";
import * as Location from "expo-location";

const { width, height } = Dimensions.get("window");

// Standby possible-issue options — feeds the dropdown-style picker
const STANDBY_ISSUE_OPTIONS = ["Seizure", "Cancer", "High Blood Pressure", "Diabetes", "Other"];

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const [medics, setMedics] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Location-choice modal state
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [pendingRequestType, setPendingRequestType] = useState(null); // "emergency" | "standby"
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Standby-only: possible issue picker state
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [customIssueText, setCustomIssueText] = useState("");

  // Auto-popup dispatch toast state
  const [dispatchToast, setDispatchToast] = useState(null);
  const seenDispatchIds = useRef(new Set());

  const router = useRouter();

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

  const filteredMedics = medics.filter((medic) => {
    if (!searchQuery.trim()) return true;
    const haystack = `${medic.establishmentName || ""} ${medic.providerType || ""}`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  // ── SOS request — kept as its own dedicated function ──
  const sendEmergencyRequest = async (latitude, longitude) => {
    try {
      const user = getAuth().currentUser;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      await addDoc(collection(db, "requests"), {
        userId: user.uid,
        userName: userData.fullName,
        type: "emergency",
        latitude,
        longitude,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Emergency Request Sent", "Help is on the way!");
    } catch (error) {
      console.error("Error sending emergency request: ", error);
      Alert.alert("Failed to send request", "Please try again.");
    }
  };

  // ── Standby request — now also carries the citizen's selected possible issue ──
  const sendStandbyRequest = async (latitude, longitude, issue) => {
    try {
      const user = getAuth().currentUser;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      await addDoc(collection(db, "requests"), {
        userId: user.uid,
        userName: userData.fullName,
        type: "standby",
        latitude,
        longitude,
        issue: issue || "Not specified",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Standby Request Sent", "Medical team will be on standby.");
    } catch (error) {
      console.error("Error sending standby request: ", error);
      Alert.alert("Failed to send request", "Please try again.");
    }
  };

  const openLocationChoice = (type) => {
    setPendingRequestType(type);
    setLocationModalVisible(true);
  };

  // Only used by the Emergency SOS button
  const dispatchRequest = (latitude, longitude) => {
    if (pendingRequestType === "emergency") {
      sendEmergencyRequest(latitude, longitude);
    }
  };

  // Option A: fetch live GPS location
  const handleUseCurrentLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Location permission is needed to use your current location.");
        setIsFetchingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      const { latitude, longitude } = loc.coords;

      setIsFetchingLocation(false);
      setLocationModalVisible(false);

      if (pendingRequestType === "standby") {
        setPendingCoords({ latitude, longitude });
        setIssueModalVisible(true);
        return;
      }

      Alert.alert(
        "Location Found",
        `Lat: ${latitude.toFixed(6)}\nLng: ${longitude.toFixed(6)}`,
        [{ text: "Send Request", onPress: () => dispatchRequest(latitude, longitude) }]
      );
    } catch (error) {
      console.error("Error getting current location: ", error);
      setIsFetchingLocation(false);
      Alert.alert("Location Error", "Couldn't get your current location. Please try again.");
    }
  };

  // Option B: use the location saved during registration
  const handleUseRegisteredLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const user = getAuth().currentUser;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (!userData?.latitude || !userData?.longitude) {
        setIsFetchingLocation(false);
        Alert.alert("No Registered Location", "We couldn't find a saved location on your profile.");
        return;
      }

      const { latitude, longitude } = userData;

      setIsFetchingLocation(false);
      setLocationModalVisible(false);

      if (pendingRequestType === "standby") {
        setPendingCoords({ latitude: Number(latitude), longitude: Number(longitude) });
        setIssueModalVisible(true);
        return;
      }

      Alert.alert(
        "Registered Location Found",
        `Lat: ${Number(latitude).toFixed(6)}\nLng: ${Number(longitude).toFixed(6)}`,
        [{ text: "Send Request", onPress: () => dispatchRequest(latitude, longitude) }]
      );
    } catch (error) {
      console.error("Error reading registered location: ", error);
      setIsFetchingLocation(false);
      Alert.alert("Error", "Couldn't load your registered location. Please try again.");
    }
  };

  // Standby issue picker — confirm & submit
  const handleConfirmStandbyIssue = () => {
    if (!selectedIssue) {
      Alert.alert("Select an Issue", "Please choose a possible issue before sending.");
      return;
    }
    if (selectedIssue === "Other" && !customIssueText.trim()) {
      Alert.alert("Add a Detail", "Please describe the issue since you selected 'Other'.");
      return;
    }

    const finalIssue = selectedIssue === "Other" ? customIssueText.trim() : selectedIssue;

    setIssueModalVisible(false);
    sendStandbyRequest(pendingCoords.latitude, pendingCoords.longitude, finalIssue);

    setSelectedIssue(null);
    setCustomIssueText("");
    setPendingCoords(null);
  };

  const handleCancelIssueModal = () => {
    setIssueModalVisible(false);
    setSelectedIssue(null);
    setCustomIssueText("");
    setPendingCoords(null);
  };

  // Single consolidated listener: drives the unread badge AND the auto-popup dispatch toast.
  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;

    const q = query(
      collection(db, "requests"),
      where("userId", "==", user.uid),
    );

    const unsubscribe = onSnapshot(q, (snapShot) => {
      let unread = 0;
      snapShot.forEach((docSnap) => {
        const data = docSnap.data();

        if (data.status === "dispatched" || (data.status === "completed" && data.paymentPending === true)) {
          unread++;
        }

        // Auto-popup only for dispatches that JUST happened — prevents re-popup on every login
        const dispatchedSeconds = data.dispatchedAt?.seconds || 0;
        const isRecentDispatch = dispatchedSeconds && (Date.now() / 1000 - dispatchedSeconds) < 60;

        if (data.status === "dispatched" && isRecentDispatch && !seenDispatchIds.current.has(docSnap.id)) {
          seenDispatchIds.current.add(docSnap.id);
          setDispatchToast({
            id: docSnap.id,
            driverName: data.driverName || "Paramedic Team",
            plateNumber: data.plateNumber || "N/A",
            estimatedArrivalMinutes: data.estimatedArrivalMinutes,
          });
        }
      });
      setUnreadCount(unread);
    }, (error) => {
      console.error("Error listening to live stream updates: ", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (dispatchToast) {
      const timer = setTimeout(() => setDispatchToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [dispatchToast]);

  const confirmLogout = () => {
    Alert.alert(
      "Confirm Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await signOut(getAuth());
            router.replace("/auth/login");
          },
        },
      ]);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      confirmLogout();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      {/* 1. Main Dynamic Content Container Layer */}
      <View style={styles.mainContent}>
        {activeTab === "home" && (
          <View style={{ flex: 1 }}>
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

                  <TouchableOpacity style={styles.glassBellBtn} activeOpacity={0.7} onPress={confirmLogout}>
                    <LogOut color="#D62828" size={17} />
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

            <View style={styles.sosWrapper} pointerEvents="box-none">
              <View style={styles.sosRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.sosButton}
                  onPress={() => openLocationChoice("emergency")}
                >
                  <View style={styles.sosGlossHighlight} />
                  <ShieldAlert color="white" size={34} strokeWidth={2.2} />
                  <Text style={styles.sosText}>SOS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.standbyButton}
                  onPress={() => openLocationChoice("standby")}
                >
                  <View style={styles.standbyGlossHighlight} />
                  <Clock color="white" size={32} strokeWidth={2.2} />
                  <Text style={styles.standbyButtonText}>Standby</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.smsHintBtn}
                activeOpacity={0.75}
                onPress={() => {
                  const primaryResponder = medics[0]?.phone || "999";
                  triggerSMSFallback(primaryResponder);
                }}
              >
                <MessageSquare color="#0057B8" size={14} strokeWidth={2.3} />
                <Text style={styles.smsHintText}>Tap for Emergency SMS Dispatch</Text>
              </TouchableOpacity>
            </View>

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

        {activeTab === "first_aid" && (
          <View style={{ flex: 1, paddingTop: 50 }}>
            <FirstAid />
          </View>
        )}

        {activeTab === "ambulances" && (
          <View style={styles.scroller}>
            <AmbulanceHotlines />
          </View>
        )}

        {activeTab === "profile" && (
          <Profile />
        )}
      </View>

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

      <NotificationsSheet
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Location Choice Modal — shown for both SOS and Standby, routes via pendingRequestType */}
      {locationModalVisible && (
        <View style={locationStyles.overlay}>
          <View style={locationStyles.sheet}>
            <View style={locationStyles.handle} />
            <Text style={locationStyles.title}>
              {pendingRequestType === "emergency" ? "Send Emergency SOS" : "Request Standby"}
            </Text>
            <Text style={locationStyles.subtitle}>Which location should we send?</Text>

            {isFetchingLocation ? (
              <View style={locationStyles.loadingRow}>
                <ActivityIndicator color="#0057B8" />
                <Text style={locationStyles.loadingText}>Getting location...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={locationStyles.optionBtn}
                  activeOpacity={0.85}
                  onPress={handleUseCurrentLocation}
                >
                  <Navigation color="#0057B8" size={20} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={locationStyles.optionTitle}>Use Current Location</Text>
                    <Text style={locationStyles.optionSub}>Get my live GPS position</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={locationStyles.optionBtn}
                  activeOpacity={0.85}
                  onPress={handleUseRegisteredLocation}
                >
                  <MapPin color="#0057B8" size={20} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={locationStyles.optionTitle}>Use Registered Location</Text>
                    <Text style={locationStyles.optionSub}>Use the address on my profile</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={locationStyles.cancelBtn}
                  activeOpacity={0.7}
                  onPress={() => setLocationModalVisible(false)}
                >
                  <Text style={locationStyles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}

      {/* Standby-only: Possible Issue Picker */}
      {issueModalVisible && (
        <View style={issueStyles.overlay}>
          <View style={issueStyles.sheet}>
            <View style={issueStyles.handle} />
            <View style={issueStyles.headerRow}>
              <Stethoscope color="#0057B8" size={20} />
              <Text style={issueStyles.title}>What is the Possible Issue?</Text>
            </View>
            <Text style={issueStyles.subtitle}>
              This helps the medic team come prepared with the right equipment.
            </Text>

            <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
              {STANDBY_ISSUE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[issueStyles.optionRow, selectedIssue === option && issueStyles.optionRowSelected]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedIssue(option)}
                >
                  <View style={[issueStyles.radioOuter, selectedIssue === option && issueStyles.radioOuterSelected]}>
                    {selectedIssue === option && <View style={issueStyles.radioInner} />}
                  </View>
                  <Text style={[issueStyles.optionText, selectedIssue === option && issueStyles.optionTextSelected]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}

              {selectedIssue === "Other" && (
                <TextInput
                  style={issueStyles.customInput}
                  placeholder="Please describe the issue..."
                  placeholderTextColor="#9CA3AF"
                  value={customIssueText}
                  onChangeText={setCustomIssueText}
                  multiline
                />
              )}
            </ScrollView>

            <View style={issueStyles.actionsRow}>
              <TouchableOpacity style={issueStyles.cancelBtn} activeOpacity={0.7} onPress={handleCancelIssueModal}>
                <Text style={issueStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={issueStyles.confirmBtn} activeOpacity={0.85} onPress={handleConfirmStandbyIssue}>
                <Text style={issueStyles.confirmText}>Send Standby Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Auto-popup dispatch toast */}
      {dispatchToast && (
        <View style={toastStyles.wrapper} pointerEvents="box-none">
          <TouchableOpacity
            style={toastStyles.card}
            activeOpacity={0.9}
            onPress={() => {
              setDispatchToast(null);
              setIsNotificationsOpen(true);
            }}
          >
            <View style={toastStyles.iconCircle}>
              <Ambulance color="#2E654C" size={22} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={toastStyles.title}>Ambulance Dispatched</Text>
              <Text style={toastStyles.detail}>
                {dispatchToast.driverName} • {dispatchToast.plateNumber}
              </Text>
              {dispatchToast.estimatedArrivalMinutes ? (
                <Text style={toastStyles.eta}>ETA: {dispatchToast.estimatedArrivalMinutes} mins</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => setDispatchToast(null)} hitSlop={10}>
              <X color="#94A3B8" size={18} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6F4FE" },
  mainContent: { flex: 1 },
  mockMap: { width: "100%", height: height, backgroundColor: "#DCE9F5" },
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
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#EAF3FD", justifyContent: "center", alignItems: "center", marginRight: 10,
  },
  glassPillText: { fontSize: 16, fontWeight: "800", color: "#0057B8", letterSpacing: 0.2 },
  glassBellBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#EEF3F9", position: "relative",
  },
  badgeDot: { position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: "#D62828" },
  searchPill: {
    flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)", shadowColor: "#1D2D44", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 14, elevation: 6, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1D2D44", fontWeight: "500" },
  sosWrapper: { position: "absolute", top: height * 0.32, left: 0, right: 0, alignItems: "center", zIndex: 20 },
  sosRow: { flexDirection: "row", alignItems: "center", gap: 22 },
  sosButton: {
    width: 104, height: 104, borderRadius: 52, backgroundColor: "#D62828",
    justifyContent: "center", alignItems: "center", shadowColor: "#9D1D1D",
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 10,
    borderWidth: 3, borderColor: "rgba(255,255,255,0.55)", overflow: "hidden",
  },
  sosGlossHighlight: {
    position: "absolute", top: -18, left: -8, width: 130, height: 64, borderRadius: 64,
    backgroundColor: "rgba(255,255,255,0.18)", transform: [{ rotate: "-10deg" }],
  },
  sosText: { color: "white", fontSize: 19, fontWeight: "900", letterSpacing: 1.3, marginTop: 2 },
  standbyButton: {
    width: 104, height: 104, borderRadius: 52, backgroundColor: "#F4A261",
    justifyContent: "center", alignItems: "center", shadowColor: "#C97A35",
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 10,
    borderWidth: 3, borderColor: "rgba(255,255,255,0.55)", overflow: "hidden",
  },
  standbyGlossHighlight: {
    position: "absolute", top: -18, left: -8, width: 130, height: 64, borderRadius: 64,
    backgroundColor: "rgba(255,255,255,0.2)", transform: [{ rotate: "-10deg" }],
  },
  standbyButtonText: { color: "white", fontSize: 13, fontWeight: "800", letterSpacing: 0.6, marginTop: 4 },
  smsHintBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, marginTop: 14, gap: 6,
    shadowColor: "#1D2D44", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  smsHintText: { fontSize: 11, fontWeight: "700", color: "#0057B8" },
  bottomSheet: {
    position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(255,255,255,0.98)",
    borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 130,
    shadowColor: "#1D2D44", shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 12,
  },
  sheetHandle: { width: 40, height: 5, backgroundColor: "#E0E6ED", borderRadius: 3, alignSelf: "center", marginBottom: 16 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: "#1D2D44" },
  sheetCount: { fontSize: 12, color: "#8A9BAE", marginTop: 2, fontWeight: "500" },
  searchBarSim: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EAF3FD", justifyContent: "center", alignItems: "center" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 30, gap: 10 },
  emptyStateText: { fontSize: 13, color: "#9BB3C9", fontWeight: "500" },
  facilityCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#F8FBFE", padding: 14, borderRadius: 18, marginBottom: 10,
    borderWidth: 1, borderColor: "#EDF2F8",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconCircle: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: "#E6F4FE",
    justifyContent: "center", alignItems: "center", overflow: "hidden",
  },
  iconCircleGloss: {
    position: "absolute", top: -8, left: -4, width: 50, height: 26, borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.5)", transform: [{ rotate: "-8deg" }],
  },
  facilityName: { fontWeight: "700", fontSize: 14.5, color: "#1D2D44" },
  facilityTagRow: { flexDirection: "row", marginTop: 5 },
  facilityTagPill: { backgroundColor: "#E6F4FE", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  facilityTagPillText: { fontSize: 10.5, color: "#0057B8", fontWeight: "700" },
  cardRightBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFFFFF",
    justifyContent: "center", alignItems: "center", marginLeft: 8, borderWidth: 1, borderColor: "#E6F4FE",
  },
  scroller: { flex: 1, padding: 20, paddingTop: 60 },
  screenHeader: { fontSize: 24, fontWeight: "800", color: "#0057B8", marginBottom: 5 },
  tabBarWrapper: { position: "absolute", bottom: 22, left: 18, right: 18, zIndex: 25 },
  tabBar: {
    height: 68, backgroundColor: "rgba(255,255,255,0.95)", flexDirection: "row", borderRadius: 30,
    paddingHorizontal: 6, shadowColor: "#1D2D44", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18, shadowRadius: 20, elevation: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.7)",
  },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center", gap: 3 },
  tabIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  tabIconWrapActive: {
    backgroundColor: "#0057B8", shadowColor: "#0057B8", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  tabLabel: { fontSize: 10.5, fontWeight: "700" },
  logoutHeaderBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFEAE8",
    justifyContent: "center", alignItems: "center",
  },
});

const locationStyles = StyleSheet.create({
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end", zIndex: 200,
  },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 22, paddingTop: 14, paddingBottom: 34,
  },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: "#E0E6ED", alignSelf: "center", marginBottom: 18 },
  title: { fontSize: 18, fontWeight: "800", color: "#1D2D44", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#8A9BAE", textAlign: "center", marginTop: 4, marginBottom: 20 },
  optionBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F8FBFE",
    borderWidth: 1, borderColor: "#EDF2F8", borderRadius: 16, padding: 16, marginBottom: 12,
  },
  optionTitle: { fontSize: 14.5, fontWeight: "700", color: "#1D2D44" },
  optionSub: { fontSize: 12, color: "#8A9BAE", marginTop: 2 },
  cancelBtn: { paddingVertical: 12, alignItems: "center", marginTop: 4 },
  cancelText: { fontSize: 14, fontWeight: "700", color: "#D62828" },
  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 20 },
  loadingText: { fontSize: 13, color: "#0057B8", fontWeight: "600" },
});

const issueStyles = StyleSheet.create({
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end", zIndex: 210,
  },
  sheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 22, paddingTop: 14, paddingBottom: 30,
  },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: "#E0E6ED", alignSelf: "center", marginBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  title: { fontSize: 17, fontWeight: "800", color: "#1D2D44" },
  subtitle: { fontSize: 12.5, color: "#8A9BAE", textAlign: "center", marginTop: 6, marginBottom: 16, paddingHorizontal: 10 },
  optionRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F8FBFE",
    borderWidth: 1, borderColor: "#EDF2F8", borderRadius: 14, padding: 14, marginBottom: 10,
  },
  optionRowSelected: { borderColor: "#0057B8", backgroundColor: "#E6F4FE" },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#CBD5E1",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  radioOuterSelected: { borderColor: "#0057B8" },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#0057B8" },
  optionText: { fontSize: 14.5, fontWeight: "600", color: "#475569" },
  optionTextSelected: { color: "#0057B8", fontWeight: "700" },
  customInput: {
    backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12,
    padding: 12, fontSize: 14, color: "#1D2D44", marginTop: 4, marginBottom: 12, minHeight: 60, textAlignVertical: "top",
  },
  actionsRow: { flexDirection: "row", gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 14, backgroundColor: "#F1F5F9" },
  cancelText: { fontSize: 14, fontWeight: "700", color: "#64748B" },
  confirmBtn: { flex: 2, paddingVertical: 14, alignItems: "center", borderRadius: 14, backgroundColor: "#0057B8" },
  confirmText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});

const toastStyles = StyleSheet.create({
  wrapper: { position: "absolute", top: 120, left: 18, right: 18, zIndex: 300 },
  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F0F9F4",
    borderWidth: 1, borderColor: "#B8DCC9", borderRadius: 20, padding: 14,
    shadowColor: "#1D2D44", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
  },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E3EFEA", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 14, fontWeight: "800", color: "#2E654C" },
  detail: { fontSize: 12.5, color: "#477E64", fontWeight: "600", marginTop: 2 },
  eta: { fontSize: 11.5, color: "#2E654C", fontWeight: "700", marginTop: 3 },
});