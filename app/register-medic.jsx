import {
  View, 
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView
} from "react-native";

import { useState } from "react";

import { auth, db } from "../firebase/firebaseConfig";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
} from "firebase/firestore";

export default function RegisterMedic() {

  const [establishmentName, setEstablishmentName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {

    try {

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          establishmentName,
          email,
          phone,
          licenseNumber,
          location,

          role: "medic",

          status: "pending",

          createdAt: new Date()
        }
      );

      Alert.alert(
        "Success",
        "Medic registered successfully"
      );

    } catch (error) {

      Alert.alert(
        "Error",
        error.message
      );

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
          backgroundColor: "green",
          padding: 15,
          borderRadius: 10
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