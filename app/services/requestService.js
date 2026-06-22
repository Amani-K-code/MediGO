import {
    doc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";

export const dispatchAmbulance = async (
    requestId,
    medicId,
    driverName,
    ambualncePlate,
    eta
) => {
    await updateDoc(
        doc(db, "requests", requestId),
        {
            status: "dispatched",
            assignedMedicId: medicId,
            driverName,
            ambualncePlate,
            eta,
            dispatchedAt: serverTimestamp(),
            citizenCanRate: false,
            paymentPending: false,
        }
    );
}

export const markComplete = async (requestId) => {
    await updateDoc(
        doc(db, "requests", requestId),
        {
            status: "completed",
            completedAt: serverTimestamp(),

            citizenCanRate: true,
        }
    );
};

export const markPendingPayment = async (requestId) => {
    await updateDoc(
        doc(db, "requests", requestId),
        {
            status: "pending_payment",
            pendingPaymentAt: serverTimestamp(),
            citizenCanRate: true,
            paymentPending: true,
        }
    );
};