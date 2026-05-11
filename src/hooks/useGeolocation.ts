import { useState, useEffect, useCallback, useRef } from "react";

interface GeoPosition {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  loading: boolean;
  permissionState: PermissionState | "unsupported" | null;
  requestPermission: () => void;
  startWatching: () => void;
  stopWatching: () => void;
}

function describeError(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Location permission denied. Please enable it in your browser settings.";
    case err.POSITION_UNAVAILABLE:
      return "Unable to determine your location. Check your GPS or network.";
    case err.TIMEOUT:
      return "Location request timed out. Please try again.";
    default:
      return err.message || "Could not get your location.";
  }
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState | "unsupported" | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Detect permission state (with fallback for browsers w/o Permissions API)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setPermissionState("unsupported");
      setError("Geolocation is not supported by your browser.");
      return;
    }
    if ("permissions" in navigator && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((result) => {
          setPermissionState(result.state);
          result.onchange = () => setPermissionState(result.state);
          if (result.state === "granted") getPosition();
        })
        .catch(() => setPermissionState("prompt"));
    } else {
      // Safari / older browsers — assume prompt
      setPermissionState("prompt");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPosition = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setError(null);
        setLoading(false);
        setPermissionState("granted");
      },
      (err) => {
        setError(describeError(err));
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) setPermissionState("denied");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  const startWatching = useCallback(() => {
    if (!("geolocation" in navigator) || watchIdRef.current !== null) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setError(null);
        setPermissionState("granted");
      },
      (err) => {
        setError(describeError(err));
        if (err.code === err.PERMISSION_DENIED) setPermissionState("denied");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => () => stopWatching(), [stopWatching]);

  return { position, error, loading, permissionState, requestPermission: getPosition, startWatching, stopWatching };
}
