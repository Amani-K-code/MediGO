import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export default function CitizenDashboard() {
  return (

  <ScrollView
    style={{
      flex: 1,
      backgroundColor: "#EAF4FF",
      padding: 20
    }}
  >

    <Text
      style={{
        fontSize: 28,
        fontWeight: "bold",
        color: "#0057B8",
        marginTop: 30
      }}
    >
      MediGo
    </Text>

    <Text
      style={{
        fontSize: 18,
        marginBottom: 20
      }}
    >
      Citizen Dashboard
    </Text>

    <View
      style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 20,
        marginBottom: 20
      }}
    >
      <Text style={{ fontSize: 18 }}>
        📍 Current Location
      </Text>

      <Text>Athi River, Kenya</Text>
    </View>

    <TouchableOpacity
      style={{
        backgroundColor: "#D62828",
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 60,
        marginBottom: 20
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 30,
          fontWeight: "bold"
        }}
      >
        SOS
      </Text>
    </TouchableOpacity>

    <View
      style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 20
      }}
    >
      <Text style={{ fontWeight: "bold" }}>
        Nearby Hospitals
      </Text>

      <Text>🏥 Nairobi West Hospital</Text>
      <Text>🏥 Lifecare Hospital</Text>
      <Text>🏥 Athi River Medical Centre</Text>
    </View>

  </ScrollView>

);
}