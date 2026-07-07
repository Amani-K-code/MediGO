import { db, storage } from "../../firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
        // Double map keys to completely eliminate UI "undefined" property crashes
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
    
    // Map backwards-compatible keys if any legacy fields try to save
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

export const uploadProfilePhoto = async (uid, localUri) => {
    const response = await fetch(localUri);
    const blob = await response.blob();

    const storageRef = ref(storage, `users/${uid}/profile.jpg`);
    await uploadBytes(storageRef, blob);

    const url = await getDownloadURL(storageRef);
    return url;
};