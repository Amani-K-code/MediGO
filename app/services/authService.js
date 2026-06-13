import {auth, db } from "../../firebase/firebaseConfig";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";

import {
    doc,
    setDoc,
} from "firebase/firestore";

export const registerCitizen = async (
    fullName,
    email,
    phone,
    nextOfKin,
    nextOfKinPhone,
    residence,
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
            fullName,
            email,
            phone,
            nextOfKin,
            nextOfKinPhone,
            residence,
            role: "citizen",
            createdAt: new Date()
        }
     );

    };

export const registerMedic = async (
    establishmentName,
    email,  
    phone,
    licenseNumber,
    location,
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

            role: "medic",
            status: "pending",

            createdAt: new Date()
         }
     );

    };

    export const login = async (
        email,
        password
    ) => {

        return await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    };


