import React, { useState, useRef, useMemo } from "react";
import {
  Dimensions, ScrollView, StyleSheet, Text,
  TouchableOpacity, View, ActivityIndicator
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import {
  Ambulance, HeartPulse, Home, MapPin,
  Navigation, Search, ShieldAlert, User
} from "lucide-react-native";

import useLocation from "../hooks/useLocation";
import { getDistanceKm } from "../utils/distance";
import FirstAid from "./firstAid";
import Profile from "./profile";

const { width, height } = Dimensions.get("window");
const RADIUS_KM = 50;

// --- Seed data (replace with Firestore fetch later) ---
// Think of this as your handwritten notebook of facilities
const ALL_FACILITIES = [
  { id: "1", name: "Nairobi West Hospital",      lat: -1.3167, lng: 36.8167, tag: "Trauma Center" },
  { id: "2", name: "Kenyatta National Hospital",  lat: -1.3008, lng: 36.8063, tag: "National Referral" },
  { id: "3", name: "Aga Khan University Hospital",lat: -1.2617, lng: 36.8167, tag: "Private Hospital" },
  { id: "4", name: "Lifecare Hospital",           lat: -1.4800, lng: 36.9900, tag: "General Clinic" },
  { id: "5", name: "Athi River Medical Centre",   lat: -1.4567, lng: 36.9833, tag: "Pharmacy/Facility" },
];

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("home");
  const { coords, errorMsg, loading } = useLocation();
  const mapRef = useRef(null);

  // Filter facilities within 50km — recalculates only when coords change
  // Like a bouncer who only lets in guests on the list AND within the venue
  const nearbyFacilities = useMemo(() => {
    if (!coords) return [];
    return ALL_FACILITIES
      .map((f) => ({
        ...f,
        distance: getDistanceKm(coords.latitude, coords.longitude, f.lat, f.lng),
      }))
      .filter((f) => f.distance <= RADIUS_KM)
      .sort((a, b) => a.distance - b.distance);
  }, [coords]);

  const initialRegion = coords
    ? {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.8, // zoomed out enough to show 50km radius
        longitudeDelta: 0.8,
      }
    : {
        // Default center on Nairobi while GPS warms up
        latitude: -1.286389,
        longitude: 36.817223,
        latitudeDelta: 0.8,
        longitudeDelta: 0.8,
      };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {activeTab === "home" && (
          <View style={{ flex: 1 }}>

            {/* ── MAP LAYER ── */}
            {loading ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color="#0057B8" />
                <Text style={styles.loaderText}>Acquiring your location…</Text>
              </View>
            ) : errorMsg ? (
              <View style={styles.loaderBox}>
                <Text style={{ color: "#D62828" }}>{errorMsg}</Text>
              </View>
            ) : (
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={initialRegion}
                showsUserLocation={true}      // blue dot — the user's live position
                followsUserLocation={true}    // map re-centers as they move
                showsMyLocationButton={false} // we'll add our own button later
              >
                {/* The 50km spotlight */}
                {coords && (
                  <Circle
                    center={{ latitude: coords.latitude, longitude: coords.longitude }}
                    radius={RADIUS_KM * 1000} // metres
                    strokeColor="rgba(0, 87, 184, 0.4)"
                    fillColor="rgba(0, 87, 184, 0.08)"
                    strokeWidth={2}
                  />
                )}

                {/* A pin for each facility inside the radius */}
                {nearbyFacilities.map((f) => (
                  <Marker
                    key={f.id}
                    coordinate={{ latitude: f.lat, longitude: f.lng }}
                    title={f.name}
                    description={f.tag}
                    pinColor="#D62828"
                  />
                ))}
              </MapView>
            )}

            {/* ── FLOATING LOCATION BADGE ── */}
            {coords && (
              <View style={styles.floatingHeader}>
                <View style={styles.locationBadge}>
                  <MapPin color="#D62828" size={18} />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.locTitle}>Live Location</Text>
                    <Text style={styles.locSub}>
                      {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)} • Accuracy{" "}
                      {Math.round(coords.accuracy)}m
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── SOS BUTTON ── */}
            <View style={styles.sosWrapper}>
              <TouchableOpacity activeOpacity={0.8} style={styles.sosButton}>
                <ShieldAlert color="white" size={44} />
                <Text style={styles.sosText}>SOS</Text>
              </TouchableOpacity>
              <Text style={styles.sosSubtext}>Tap once to execute SMS Fail-Safe fallback</Text>
            </View>

            {/* ── BOTTOM SHEET ── */}
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>
                  {nearbyFacilities.length} Facilities Within {RADIUS_KM}km
                </Text>
                <TouchableOpacity style={styles.searchBarSim}>
                  <Search color="#666" size={16} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 220 }}>
                {nearbyFacilities.length === 0 && !loading && (
                  <Text style={{ color: "#64748B", textAlign: "center", marginTop: 16 }}>
                    No facilities found within {RADIUS_KM}km.
                  </Text>
                )}
                {nearbyFacilities.map((hosp) => (
                  <View key={hosp.id} style={styles.facilityCard}>
                    <View style={styles.cardLeft}>
                      <View style={styles.iconCircle}>
                        <Ambulance color="#0057B8" size={20} />
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.facilityName}>{hosp.name}</Text>
                        <Text style={styles.facilityTag}>{hosp.tag}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.distanceText}>{hosp.distance.toFixed(1)} km</Text>
                      <TouchableOpacity style={styles.routeBtn}>
                        <Navigation color="white" size={12} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* ── OTHER TABS (unchanged) ── */}
        {activeTab === "first_aid" && <FirstAid />}
        {activeTab === "ambulances" && (
          <ScrollView style={styles.scroller}>
            <Text style={styles.screenHeader}>Emergency Hotlines</Text>
          </ScrollView>
        )}
        {activeTab === "profile" && <Profile />}
      </View>

      {/* ── TAB BAR (unchanged) ── */}
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
  map: { width: "100%", height: height * 0.55 },
  loaderBox: { width: "100%", height: height * 0.55, justifyContent: "center", alignItems: "center", backgroundColor: "#CBE3F7" },
  loaderText: { marginTop: 12, color: "#0057B8", fontWeight: "600" },
  floatingHeader: { position: "absolute", top: 50, left: 20, right: 20, zIndex: 10 },
  locationBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 12, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  locTitle: { fontWeight: "700", fontSize: 14, color: "#1D2D44" },
  locSub: { fontSize: 11, color: "#666" },
  sosWrapper: { position: "absolute", top: height * 0.35, left: 0, right: 0, alignItems: "center", zIndex: 20 },
  sosButton: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#D62828", justifyContent: "center", alignItems: "center", shadowColor: "#D62828", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8, borderWidth: 4, borderColor: "rgba(255,255,255,0.4)" },
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
  tabBar: { height: 70, backgroundColor: "white", flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingBottom: 10 },
  tabItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabLabel: { fontSize: 10, fontWeight: "600", marginTop: 4 },
});