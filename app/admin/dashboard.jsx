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

    <ScrollView style={{ padding: 20 }}>

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
            borderWidth: 1,
            padding: 10,
            marginBottom: 10
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
              backgroundColor: "green",
              padding: 10,
              marginTop: 10
            }}
          >
            <Text style={{ color: "white" }}>
              Approve
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => rejectMedic(medic.id)}
            style={{
              backgroundColor: "red",
              padding: 10,
              marginTop: 10
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