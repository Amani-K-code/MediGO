import { View, Text } from "react-native";

export default function CitizenDashboard() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Text style={{ fontSize: 24 }}>
        Citizen Dashboard
      </Text>
    </View>
  );
}