import React from "react";
import {View, StyleSheet} from "react-native";
import MapView, {Marker} from "react-native-maps";

export default function Hospitals() {
    const hospitals = [
        {
            id: 1,
            name: "Kenyatta National Hospital",
            latitude: -1.3016,
            longitude: 36.8065,
        },

        {
            id: 2,
            name: "Nairobi Hospital",
            latitude: -1.3005,
            longitude: 36.8123,
        },

        {
            id: 3,
            name: "Aga Khan University Hospital",
            latitude: -1.2636,
            longitude: 36.8365,

        },

        {

            id: 4,
            name: "MP Shah Hospital",
            latitude: -1.2649,
            longitude: 36.8044,
        },

        {
            id: 5,
            name: "Karen Hospital",
            latitude: -1.3196,
            longitude: 36.7084,
        },
    ];

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                latitude: -1.286389,
                longitude: 36.817223,
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
                }}
            >
                {hospitals.map((hospital) => (
                <Marker
                    key={hospital.id}
                    coordinate={{
                    latitude: hospital.latitude,
                    longitude: hospital.longitude,
                    }}
                    title={hospital.name}
                    description="Medical Facility"
                />
                ))}
            </MapView>
            </View>
        );
        }

        const styles = StyleSheet.create({
        container: {
            flex:1,
        },
        map: {
            flex: 1,
        },
    });