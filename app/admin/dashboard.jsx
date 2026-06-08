import { 
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from "react-native";

import { useEffect, useState } from "react";




export default function AdminDashboard() {

  const [medics, setMedics] = useState([]);

  useEffect(() => {

    fetchMedics();

  }, []);

  const fetchMedics = async () => {

    const querySnapshot =
      await getDocs(
        collection(db, "users")
      );

    const medicList = [];

    querySnapshot.forEach((doc) => {

      const data = doc.data();

      if (data.role === "medic") {

        medicList.push({
          id: doc.id,
          ...data
        });

      }

    });

    setMedics(medicList);

  };

  const approveMedic = async (id) => {

      await updateDoc(
        doc(db, "users", id),
        {
          status: "approved"
        }
      );
      fetchMedics();
    };

    const rejectMedic = async (id) => {

      await updateDoc(
        doc(db, "users", id),
        {
          status: "rejected"
        }
      );

      fetchMedics();

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
        Pending Medics
      </Text>

      {medics.map((medic) => (

        <View
          key={medic.id}
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 20,
            marginBottom: 15
          }}
        >

          <Text>
            {medic.establishmentName}
          </Text>

          <Text>
            Status: {medic.status}
          </Text>

          <TouchableOpacity
            onPress={() => approveMedic(medic.id)}
            style={{
              backgroundColor: "#198754",
              padding: 12,
              marginTop: 10,
              borderRadius: 12
            }}
          >
            <Text style={{ color: "white" }}>
              Approve
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => rejectMedic(medic.id)}
            style={{
              backgroundColor: "#D62828",
              padding: 12,
              marginTop: 10,
              borderRadius: 12
            }}
          >
            <Text style={{ color: "white" }}>
              Reject
            </Text>
          </TouchableOpacity>

        </View>

      ))}

    </ScrollView>

  );
}