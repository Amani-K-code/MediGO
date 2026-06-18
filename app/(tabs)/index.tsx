import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import WelcomeScreen from "../auth/welcome_screen";

export default function Index() {
  return <WelcomeScreen />;
}
