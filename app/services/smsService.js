import {Linking, Clipboard, Alert, Platform } from "react-native";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";


/**
 * @param {string} phoneNumber - Medical Responder's phone number
 */

export const triggerSMSFallback = async (recipientPhone) => {
    if (!recipientPhone || recipientPhone === "No number provided") {
        Alert.alert("Unavailable", "No valid responder contact configured.");
        return;
    }

    try {
        const user = getAuth().currentUser;
        if (!user) {
            Alert.alert("Authentication Error", "User not authenticated. Please log in again.");
            return;
        }
    


    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    const fullName = userData.fullName || "Unknown Citizen";
    const userPhone = userData.phone || "No number provided";   

    const location = userData.location || "Nairobi, Nairobi County, Kenya"; // Default location if not provided
    const latitude = userData.latitude || "-1.2921"; 
    const longitude = userData.longitude || "36.8219";

    const smsMessage = `Hello, I am ${fullName}. I need urgent medical assistance. My contact number is ${userPhone}.My location is ${location} (Latitude: ${latitude}, Longitude: ${longitude}).`;

    const cleanedRecipient= recipientPhone.replace(/[^0-9+]/g, "");

    const separator = Platform.OS === "ios" ? "&" : "?";
    const smsUrl = `sms:${cleanedRecipient}${separator}body=${encodeURIComponent(smsMessage)}`;

    const isSupported = await Linking.canOpenURL(`sms:${cleanedRecipient}`);

    if (isSupported) {
        //Auto-copy texts to clipboard incase other method doesnot work
        Clipboard.setString(smsMessage);
        await Linking.openURL(smsUrl);
    } else {
        // Notification of copy to clipboard
        Clipboard.setString(smsMessage);
        Alert.alert(
            "SMS Copied",
            "The emergency message has been copied to your clipboard. Please paste it in your messaging app to send."
        );
    }
} catch (error) {
    console.error("Error trying to send SMS: ", error);
    Alert.alert("Error", "Failed to initiate SMS. Please try again.");
}
};