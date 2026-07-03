import { useState, useEffect, useCallback, useRef } from "react";
import { auth } from "../../firebase/firebaseConfig";
import { getMedicProfile, updateMedicProfile } from "../services/medicProfileService";

export default function useMedicProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  useEffect(() => {
    (async () => {
      try {
        const uid = auth.currentUser?.uid;
        const data = await getMedicProfile(uid);
        if (!isMountedRef.current) return;
        setProfile(data);
        setLoading(false);
      } catch (_e) {
        if (!isMountedRef.current) return;
        setError("Could not load facility profile. Please try again.");
        setLoading(false);
      }
    })();
  }, []);

  const saveField = useCallback(async (partialData) => {
    let snapshot;
    setProfile((prev) => {
      snapshot = prev;
      return { ...prev, ...partialData };
    });
    setSaving(true);
    try {
      const uid = auth.currentUser?.uid;
      await updateMedicProfile(uid, partialData);
      return { ok: true };
    } catch (_e) {
      setProfile(snapshot);
      return { ok: false, message: "Could not save changes. Please try again." };
    } finally {
      setSaving(false);
    }
  }, []);

  return { profile, loading, error, saving, saveField };
}