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

export const facilityDocRef = (uid) => {
    return doc(db, "users", uid);
};

export const emptyDefaults = () => ({
    establishmentName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    location: "",
    providerType: "facility",
    status: "pending",
    operatingHours: "",
    servicesOffered: [],
    acceptingPatients: false,
    totalAmbulances: 0,
    availableAmbulances: 0,
    profilePhotoUrl: null,
});

export const getFacilityProfile = async (uid) => {

    const snap = await getDoc(facilityDocRef(uid));

    if (snap.exists()) {
        return { ...emptyDefaults(), ...snap.data() };
    }

    return emptyDefaults();

};

export const updateFacilityProfile = async (uid, partialData) => {

    await setDoc(
        facilityDocRef(uid),
        partialData,
        { merge: true }
    );

};

export const uploadFacilityPhoto = async (uid, localUri) => {

    const response = await fetch(localUri);
    const blob = await response.blob();

    const storageRef = ref(storage, `users/${uid}/profile.jpg`);

    await uploadBytes(storageRef, blob);

    const url = await getDownloadURL(storageRef);

    return url;

};
