import { View, Text, ScrollView } from "react-native";

export default function MedicDashboard() {

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
      MediGo EMS
    </Text>

    <Text
      style={{
        fontSize: 18,
        marginBottom: 20
      }}
    >
      Medic Dashboard
    </Text>

    <View
      style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 20,
        marginBottom: 15
      }}
    >
      <Text>🟢 Status: Approved</Text>
    </View>

    <View
      style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 20,
        marginBottom: 15
      }}
    >
      <Text>🚨 Active Alerts</Text>
      <Text>0 Emergency Requests</Text>
    </View>

    <View
      style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 20
      }}
    >
      <Text>🚑 Ambulances</Text>
      <Text>Available: 3</Text>
    </View>

  </ScrollView>

);

}