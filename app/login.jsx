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
  Alert,
  ScrollView
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

        else if (userData.role === "medic"){

          if (userData.status === "approved") {
            router.replace(
              "/medic/dashboard"
            );

          } else if (userData.status === "pending") {

            Alert.alert(
              "Pending Approval",
              "Your account is still pending approval. Please wait for an admin to approve your account."
            );

          } else if (userData.status === "rejected") {

            Alert.alert(
              "Account Rejected",
              "Your account has been rejected. Please contact support for more information."
            );

          }

        }  
        
        else if (userData.role === "admin") {
          router.replace(
            "/admin/dashboard"
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
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#EAF4FF",
        padding: 20
      }}
    >

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
          Login
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

