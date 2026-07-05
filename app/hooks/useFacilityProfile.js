import { useState, useEffect, useCallback, useRef } from "react";
import { auth } from "../../firebase/firebaseConfig";
import { getFacilityProfile, updateFacilityProfile, uploadFacilityPhoto } from "../services/facilityProfileService";

export default function useFacilityProfile() {
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
        const data = await getFacilityProfile(uid);
        if (!isMountedRef.current) return;
        setProfile(data);
        setLoading(false);
      } catch (_e) {
        if (!isMountedRef.current) return;
        setError("Could not load profile. Please try again.");
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
      await updateFacilityProfile(uid, partialData);
      return { ok: true };
    } catch (_e) {
      setProfile(snapshot);
      return { ok: false, message: "Could not save changes. Please try again." };
    } finally {
      setSaving(false);
    }
  }, []);

  const uploadPhoto = useCallback(async (localUri) => {
    let previousUrl;
    setProfile((prev) => {
      previousUrl = prev?.profilePhotoUrl;
      return { ...prev, profilePhotoUrl: localUri };
    });
    try {
      const uid = auth.currentUser?.uid;
      const remoteUrl = await uploadFacilityPhoto(uid, localUri);
      const result = await saveField({ profilePhotoUrl: remoteUrl });
      if (!result.ok) {
        setProfile((prev) => ({ ...prev, profilePhotoUrl: previousUrl }));
        return { ok: false, message: "Could not upload photo. Please try again." };
      }
      return { ok: true };
    } catch (_e) {
      setProfile((prev) => ({ ...prev, profilePhotoUrl: previousUrl }));
      return { ok: false, message: "Could not upload photo. Please try again." };
    }
  }, [saveField]);

  const toggleAcceptingPatients = useCallback((nextValue) => {
    return saveField({ acceptingPatients: nextValue });
  }, [saveField]);

  const updateAvailableAmbulances = useCallback((nextCount) => {
    return saveField({ availableAmbulances: nextCount });
  }, [saveField]);

  return { profile, loading, error, saving, saveField, uploadPhoto, toggleAcceptingPatients, updateAvailableAmbulances };
}
