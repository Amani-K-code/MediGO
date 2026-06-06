import { auth,db } from "../firebase/firebaseConfig";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert

} from "react-native";

import { useState } from "react";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

  try {

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const docRef = 
        doc(db, "users", user.uid);

      const docSnap =
        await getDoc(docRef);

      if (docSnap.exists()) {

        const userData = 
          docSnap.data();

        if (
          userData.role === "citizen"
        ) {

          router.replace(
            "/citizen/dashboard"
          );

        }

      }
  } catch (error) {

    Alert.alert(
      "Login Error",
      error.message
    );

  }

};


  return (
    <View style={{ padding: 20 }}>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20
        }}
      >
        Login
      </Text>

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
        onPress={handleLogin}
        style={{
          backgroundColor: "blue",
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
          Login
        </Text>
      </TouchableOpacity>

    </View>
  );
}

