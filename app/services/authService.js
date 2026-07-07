import {auth, db } from "../../firebase/firebaseConfig";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";

import {
    doc,
    setDoc,
    getDoc,
} from "firebase/firestore";

export const registerCitizen = async (
    fullName,
    email,
    phone,
    nextOfKin,
    nextOfKinPhone,
    residence,
    latitude,
    longitude,
    password,
    bloodType,
    chronicCondition,
    allergies,
) => {

    const userCredential = 
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

    const user = userCredential.user;

    await setDoc(
        doc(db, "users", user.uid),
        {
            fullName,
            email,
            phone,
            nextOfKin,
            nextOfKinPhone,
            residence,
            latitude,
            longitude,
            bloodType,
            chronicCondition,
            allergies,
            role: "citizen",
            createdAt: new Date()
        }
     );

    };

export const registerMedic = async (
    establishmentName,
    providerType,
    email,  
    phone,
    licenseNumber,
    location,
    latitude,
    longitude,
    password
) => {

    const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

    const user = userCredential.user;

    await setDoc(
        doc(db, "users", user.uid),
        {
            establishmentName,
            email,
            phone,
            licenseNumber,
            location,
            latitude: latitude,
            longitude: longitude,
            providerType,

            role: "medic",
            status: "pending",

            createdAt: new Date()
         }
     );

    };

    export const loginUser = async (
        email,
        password
    ) => {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        const docSnap =
            await getDoc(
                doc(db, "users", user.uid)
            );

        if (!docSnap.exists()) {
         throw new Error("User data not found");
        }

        return docSnap.data();

    };


