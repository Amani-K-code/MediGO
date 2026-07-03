import { db } from "../../firebase/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const medicProfileDocRef = (uid) => {
  return doc(db, "users", uid);
};

const emptyDefaults = () => ({
  establishmentName: "",
  email: "",
  phone: "",
  licenseNumber: "",
  location: "",
  providerType: "",
  status: "",
  latitude: null,
  longitude: null,
  role: "medic",
});

export const getMedicProfile = async (uid) => {
  const snap = await getDoc(medicProfileDocRef(uid));

  if (snap.exists()) {
    return { ...emptyDefaults(), ...snap.data() };
  }

  return emptyDefaults();
};

export const updateMedicProfile = async (uid, partialData) => {
  await setDoc(medicProfileDocRef(uid), partialData, { merge: true });
};