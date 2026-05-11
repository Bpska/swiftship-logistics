import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Shield, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useGeolocation } from "@/hooks/useGeolocation";

interface Props {
  onLocationGranted?: (lat: number, lng: number) => void;
  forceOpen?: boolean;
}

export function LocationPermissionDialog({ onLocationGranted, forceOpen }: Props) {
  const { position, error, loading, permissionState, requestPermission } = useGeolocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }
    if (permissionState === null || permissionState === "granted") return;
    const dismissed = sessionStorage.getItem("location-dismissed");
    if (dismissed) return;
    if (permissionState === "prompt" || permissionState === "denied" || permissionState === "unsupported") {
      setOpen(true);
    }
  }, [permissionState, forceOpen]);

  useEffect(() => {
    if (position && onLocationGranted) {
      onLocationGranted(position.lat, position.lng);
      setOpen(false);
    }
  }, [position, onLocationGranted]);

  const handleAllow = () => requestPermission();

  const handleDismiss = () => {
    sessionStorage.setItem("location-dismissed", "true");
    setOpen(false);
  };

  if (permissionState === "granted" && !forceOpen) return null;

  const isDenied = permissionState === "denied";
  const isUnsupported = permissionState === "unsupported";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-primary/10"
          >
            {isDenied || isUnsupported ? (
              <AlertTriangle className="h-10 w-10 text-warning" />
            ) : (
              <Navigation className="h-10 w-10 text-accent" />
            )}
          </motion.div>
          <DialogTitle className="font-heading text-xl">
            {isDenied
              ? "Location Access Blocked"
              : isUnsupported
              ? "Location Not Supported"
              : "Enable Location Services"}
          </DialogTitle>
          <DialogDescription className="mt-2">
            {isDenied
              ? "You've blocked location access. Please enable it from your browser's site settings (lock icon in the address bar) and reload the page."
              : isUnsupported
              ? "Your browser doesn't support geolocation. You can still book by typing addresses manually."
              : "Allow ShipSwift to access your location for accurate pickup points, real-time tracking, and distance calculation."}
          </DialogDescription>
        </DialogHeader>

        {!isDenied && !isUnsupported && (
          <div className="mt-2 space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">Auto-fill pickup location</p>
                <p className="text-xs text-muted-foreground">Automatically detect your current address</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
              <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Live shipment tracking</p>
                <p className="text-xs text-muted-foreground">Track your goods on real-time map</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="text-sm font-medium">Your data is secure</p>
                <p className="text-xs text-muted-foreground">Location is only used while you're using ShipSwift</p>
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-destructive text-center">{error}</p>}

        <div className="mt-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleDismiss}>
            {isDenied || isUnsupported ? "Continue" : "Not Now"}
          </Button>
          {!isUnsupported && (
            <Button className="flex-1 gap-2" onClick={handleAllow} disabled={loading || isDenied}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {isDenied ? "Blocked" : "Allow Location"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
