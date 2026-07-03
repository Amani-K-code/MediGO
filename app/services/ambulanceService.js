import { db } from "../../firebase/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

// Fetches all approved medics and ambulance teams from the Firestore DB
export const fetchActiveAmbulances= async (userId) => {
    try {
        const q = query(
            collection(db, "users"),
            where("role", "==", "medic"),
            where("status", "==", "approved")
        );

        const snapshot = await getDocs(q);
        const ambulances = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            ambulances.push({
                id: doc.id,
                name: data.establishmentName || data.fullName || "Emergency Responder",
                phone: data.phone || "No number provided",
                location: data.location || "On Call / Active Duty",

            });
        });

        return { success: true, data:ambulances };

    } catch (error) {
        console.error("Error fetching ambulance fleet data: ", error);
        return { success: false, data: [] };
    }

};