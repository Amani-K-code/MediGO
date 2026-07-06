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

            if (
                data.status === "dispatched" ||
                data.status === "pending_payment" ||
                data.status === "completed" ||
                data.paymentPending === true
            ) {
                list.push({ id: docSnap.id, ...data });
            }
        });

        // Sort newest first — uses whichever timestamp is most relevant to that item's current state
        list.sort((a, b) => {
            const aTime = a.dispatchedAt?.seconds || a.completedAt?.seconds || a.createdAt?.seconds || 0;
            const bTime = b.dispatchedAt?.seconds || b.completedAt?.seconds || b.createdAt?.seconds || 0;
            return bTime - aTime;
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