import {View, Text, TextInput, TouchableOpacity, Alert, ScrollView} from 'react-native';
import { useState } from "react";
import {registerCitizen} from "./services/authService";

export default function RegisterCitizen(){

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [nextOfKin, setNextOfKin] = useState("");
    const [nextOfKinPhone, setNextOfKinPhone] = useState("");
    const [residence, setResidence] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {

        try {

            await registerCitizen(
                fullName,
                email,
                phone,
                nextOfKin,
                nextOfKinPhone,
                residence,
                password
            );

            Alert.alert("Success", "Registration successful!");
            
          } catch (error) {
            Alert.alert("Registration Error", error.message);
          }
    };

    return (
    <ScrollView style={{ padding: 20 }}>

      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Citizen Registration
      </Text>

      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Next of Kin"
        value={nextOfKin}
        onChangeText={setNextOfKin}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Next of Kin Phone"
        value={nextOfKinPhone}
        onChangeText={setNextOfKinPhone}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Residence"
        value={residence}
        onChangeText={setResidence}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TouchableOpacity
        onPress={handleRegister}
        style={{
          backgroundColor: "#0057B8",
          padding: 15,
          borderRadius: 15
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Register
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}