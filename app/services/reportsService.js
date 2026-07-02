import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

// Syncs all registered entities for tabular layout presentation
export const listenToGlobalUsers = (onUpdateReceived) => {
  return onSnapshot(collection(db, "users"), (snapshot) => {
    const userPool = [];
    snapshot.forEach((docSnap) => {
      userPool.push({ id: docSnap.id, ...docSnap.data() });
    });
    onUpdateReceived(userPool);
  }, (err) => console.error("Global users telemetry drop out:", err));
};

// Syncs global system events timeline
export const listenToAllSystemRequests = (onUpdateReceived) => {
  const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const requestPool = [];
    snapshot.forEach((docSnap) => {
      requestPool.push({ id: docSnap.id, ...docSnap.data() });
    });
    onUpdateReceived(requestPool);
  }, (err) => console.error("System requests aggregate stream cut:", err));
};

// Syncs citizen feedback parameters
export const listenToReviewsTimeline = (onUpdateReceived) => {
  const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const feedbackPool = [];
    snapshot.forEach((docSnap) => {
      feedbackPool.push({ id: docSnap.id, ...docSnap.data() });
    });
    onUpdateReceived(feedbackPool);
  }, (err) => console.error("Feedback aggregation failed:", err));
};