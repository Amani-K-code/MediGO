import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// Listens to all completed requests for the medic history terminal
export const listenToMedicHistory = (onUpdateReceived) => {

  const q = query(
    collection(db, "requests"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const historicalLogs = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Show all completed requests — medic terminal sees all resolved dispatches
      if (data.status === "completed") {
        historicalLogs.push({ id: docSnap.id, ...data });
      }
    });

    onUpdateReceived(historicalLogs);
  }, (err) => {
    console.error("History engine snapshot synchronization failure:", err);
  });
};