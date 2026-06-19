import { useState, useEffect } from "react";
import * as Location from "expo-location";

export default function useLocation() {
  const [coords, setCoords] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscriber; // holds the live watcher so we can cancel it later

    (async () => {
      // Ask the user for permission — like knocking before entering
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Location permission denied.");
        setLoading(false);
        return;
      }

      // Get a quick first fix so the map isn't blank while we wait
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCoords(initial.coords);
      setLoading(false);

      // Now start watching — updates whenever user moves > 10 metres
      // This is a tracker that only radios in when something changes
      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // metres moved before a new update fires
        },
        (location) => {
          setCoords(location.coords);
        }
      );
    })();

    // Cleanup — stop the watcher when the component unmounts
    // Like turning off the radio when you leave the ship
    return () => subscriber?.remove();
  }, []);

  return { coords, errorMsg, loading };
}