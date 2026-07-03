import { useState, useEffect, useCallback, useRef } from "react";
import { auth } from "../../firebase/firebaseConfig";
import { getProfile, updateProfile, uploadProfilePhoto } from "../services/profileService";

export default function useProfile() {
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
        const data = await getProfile(uid);
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
      await updateProfile(uid, partialData);
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
      const remoteUrl = await uploadProfilePhoto(uid, localUri);
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

  const toggleStandby = useCallback((nextValue) => {
    return saveField({ standbyEnabled: nextValue });
  }, [saveField]);

  return { profile, loading, error, saving, saveField, uploadPhoto, toggleStandby };
}