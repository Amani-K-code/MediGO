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

export const getProfile = async (uid) => {

    const snap = await getDoc(profileDocRef(uid));

    if (snap.exists()) {
        return snap.data();
    }

    const rootSnap = await getDoc(doc(db, "users", uid));

    if (rootSnap.exists()) {
        const rootData = rootSnap.data();

        return {
            name: rootData.fullName ?? "",
            location: rootData.residence ?? "",
            patientStatus: "Standby Patient",
            dateOfBirth: "",
            bloodType: "",
            primaryPhysician: "",
            emergencyContacts: rootData.nextOfKin
                ? [{ name: rootData.nextOfKin, relationship: "", phone: rootData.nextOfKinPhone ?? "" }]
                : [],
            medicalConditions: [],
            allergies: [],
            standbyEnabled: false,
            profilePhotoUrl: null,
        };
    }

    return {
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
    };

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
