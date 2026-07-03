import { db, storage } from "../../firebase/firebaseConfig";

import {
    doc,
    setDoc,
    getDoc,
} from "firebase/firestore";

import {
    ref,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";

export const profileDocRef = (uid) => {
    return doc(db, "users", uid, "profile", "data");
};

const emptyDefaults = () => ({
    name: "",
    location: "",
    patientStatus: "Standby Patient",
    dateOfBirth: "",
    bloodType: "",
    primaryPhysician: "",
    emergencyContacts: [],
    medicalConditions: [],
    allergies: [],
    standbyEnabled: false,
    profilePhotoUrl: null,
});

export const getProfile = async (uid) => {

    const snap = await getDoc(profileDocRef(uid));

    if (snap.exists()) {
        return { ...emptyDefaults(), ...snap.data() };
    }

    const rootSnap = await getDoc(doc(db, "users", uid));

    if (rootSnap.exists()) {
        const rootData = rootSnap.data();

        return {
            ...emptyDefaults(),
            name: rootData.fullName ?? "",
            location: rootData.residence ?? "",
            emergencyContacts: rootData.nextOfKin
                ? [{ name: rootData.nextOfKin, relationship: "", phone: rootData.nextOfKinPhone ?? "" }]
                : [],
        };
    }

    return emptyDefaults();

};

export const updateProfile = async (uid, partialData) => {

    await setDoc(
        profileDocRef(uid),
        partialData,
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
