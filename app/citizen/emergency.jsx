import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
} from "react-native";

import {
    collection,
    query,
    where,
    onSnapshot,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function AmbulanceTracking(){
    const user = getAuth().currentUser;
    const [request, setRequest] = useState(null);

    useEffect(() => {

        const q = query(
            collection(db, "requests"),
            where("userId", "==", user.uid),
            where("status", "==", "dispatched")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {

            snapshot.forEach((doc) => {
                setRequest({
                    id: doc.id,
                    ...doc.data(),
                });
            });

        });

        return unsubscribe;
    }, []);

    return (
        <View style={styles.container}>

            <Text style={styles.title}>
            Ambulance Tracking
            </Text>

            {request ? (
            <View style={styles.card}>

                <Text style={styles.label}>
                    Ambulance Assigned
                </Text>

                <Text style={styles.value}>
                    {request.ambulancePlate}
                </Text>

                <Text style={styles.label}>
                    Driver
                </Text>

                <Text style={styles.value}>
                    {request.ambulanceDriver}
                </Text>

                <Text style={styles.label}>
                    Contact
                </Text>

                <Text style={styles.value}>
                    {request.ambulancePhone}
                </Text>

                <Text style={styles.label}>
                    ETA
                </Text>

                <Text style={styles.value}>
                    {request.eta} mins
                </Text>

                <Text style={styles.label}>
                    Status
                </Text>

                <Text style={styles.value}>
                    {request.status}
                </Text>

            </View>
            ) : (
            <Text>No ambulance assigned yet.</Text>
            )}
        </View>
    );
}

    const styles = StyleSheet.create({
        card:{
        backgroundColor:"#fff",
        padding:20,
        borderRadius:15,
        marginTop:20,
    },

    label:{
        fontSize:12,
        color:"gray",
        marginTop:10,
    },

    value:{
        fontSize:18,
        fontWeight:"bold",
    }

    });
