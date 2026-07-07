import { db, storage } from "../../firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import * as FileSystem from "expo-file-system/legacy";

// Points to the root users collection matching registerCitizen mapping
export const profileDocRef = (uid) => {
    return doc(db, "users", uid);
};

const emptyDefaults = () => ({
    fullName: "",
    name: "", // Legacy fallback
    email: "",
    phone: "",
    residence: "",
    location: "", // Legacy fallback
    bloodType: "",
    emergencyContacts: [],
    medicalConditions: [],
    allergies: [],
    standbyEnabled: false,
    profilePhotoUrl: null,
    patientStatus: "Standby Patient",
});

const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val.trim() && val !== "None") return [val];
    return [];
};

export const getProfile = async (uid) => {
    const snap = await getDoc(profileDocRef(uid));

    if (!snap.exists()) {
        return emptyDefaults();
    }

    const data = snap.data();

    const resolvedName = data.fullName ?? data.name ?? "";
    const resolvedResidence = data.residence ?? data.location ?? "";

    return {
        ...emptyDefaults(),
        ...data,
        fullName: resolvedName,
        name: resolvedName,
        residence: resolvedResidence,
        location: resolvedResidence,
        email: data.email ?? "",
        phone: data.phone ?? "",
        bloodType: data.bloodType ?? "",
        medicalConditions: data.chronicCondition
            ? toArray(data.chronicCondition)
            : toArray(data.medicalConditions),
        allergies: toArray(data.allergies),
        emergencyContacts: data.emergencyContacts ?? (
            data.nextOfKin
                ? [{ name: data.nextOfKin, relationship: "Next of Kin", phone: data.nextOfKinPhone ?? "" }]
                : []
        ),
    };
};

export const updateProfile = async (uid, partialData) => {
    const translated = {};

    const FIELD_ALIASES = {
        name: "fullName",
        location: "residence",
        medicalConditions: "chronicCondition"
    };

    Object.entries(partialData).forEach(([key, value]) => {
        const targetKey = FIELD_ALIASES[key] || key;
        translated[targetKey] = value;
    });

    await setDoc(
        profileDocRef(uid),
        translated,
        { merge: true }
    );
};

// Fixed: fetch(localUri) unreliably returns empty/corrupt blobs for
// content:// URIs on Android. Reading via expo-file-system as base64
// and uploading with uploadString avoids that entirely.
export const uploadProfilePhoto = async (uid, localUri) => {
    try {
        console.log("Selected image:", localUri);

        const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        console.log("Base64 length:", base64.length);

        const storageRef = ref(storage, `users/${uid}/profile.jpg`);

        await uploadString(storageRef, base64, "base64", {
            contentType: "image/jpeg",
        });

        console.log("Upload successful");

        const url = await getDownloadURL(storageRef);

        console.log("Download URL:", url);

        await setDoc(
            profileDocRef(uid),
            {
                profilePhotoUrl: url,
            },
            { merge: true }
        );

        console.log("Firestore updated");

        return url;
    } catch (error) {
        console.log("UPLOAD ERROR:", error);
        throw error;
    }
};