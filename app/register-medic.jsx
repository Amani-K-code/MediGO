import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView
} from "react-native";

import { useState } from "react";

import { registerMedic } from "./services/authService";

export default function RegisterMedic() {

  const [establishmentName, setEstablishmentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {

    try {

      await registerMedic(
        establishmentName,
        email,
        phone,
        licenseNumber,
        location,
        password
      );

      Alert.alert("Success", "Registration successful!");

    } catch (error) {
      Alert.alert("Registration Error", error.message);

    }

    };

  return (
     <ScrollView style={{ padding: 20 }}>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20
        }}
      >
        Medic Registration
      </Text>

      <TextInput
        placeholder="Establishment Name"
        value={establishmentName}
        onChangeText={setEstablishmentName}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10
        }}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10
        }}
      />

      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10
        }}
      />

      <TextInput
        placeholder="License Number"
        value={licenseNumber}
        onChangeText={setLicenseNumber}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10
        }}
      />

      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10
        }}
      />

      <TouchableOpacity
        onPress={handleRegister}
        style={{
            backgroundColor: "#0057B8",
            padding: 15,
            borderRadius: 15,
            marginTop: 10
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center"
          }}
        >
          Register Medic
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}