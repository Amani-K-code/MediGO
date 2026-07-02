import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export const listenToLiveStreamUpdates = (onUpdateReceived) => {
    const auth = getAuth().currentUser;
    if (!auth) return () => {};

    const q = query(
        collection(db, "requests"),
        where("userId", "==", auth.uid)
    );

    return onSnapshot(q, (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // Update this condition in your notification service file
            if (
                data.status === "dispatched" ||
                data.status === "pending_payment" || 
                data.status === "completed" || // Allow completed requests to be caught!
                data.paymentPending === true
            ) {
                list.push({ id: docSnap.id, ...data });
            }
        });
        onUpdateReceived(list);
    }, (error) => {
        console.error("Live triage stream interception error. ", error);
    });
};

export const sendReviewFeedbackScore = async (requestId, score, note) => {
    try {
        const docRef = doc(db, "requests", requestId);
        await updateDoc(docRef, {
            rating: score,
            feedback: note,
            status: "completed",
            paymentPending: false,
            citizenCanRate: false,
        });
        await addDoc(collection(db, "reviews"), {
            requestId,
            userId: getAuth().currentUser?.uid || null,
            userName: getAuth().currentUser?.displayName || getAuth().currentUser?.email || "Anonymous",
            rating: score,
            feedback: note,
            createdAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error submitting rating parameters: ", error);
        return { success: false, error };
    }
};