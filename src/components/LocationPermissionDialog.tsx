import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useGeolocation } from "@/hooks/useGeolocation";

interface Props {
  onLocationGranted?: (lat: number, lng: number) => void;
}

export function LocationPermissionDialog({ onLocationGranted }: Props) {
  const { position, error, loading, permissionState, requestPermission } = useGeolocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show dialog if permission not yet granted
    if (permissionState === null) return;
    if (permissionState === "prompt") {
      const dismissed = sessionStorage.getItem("location-dismissed");
      if (!dismissed) setOpen(true);
    }
  }, [permissionState]);

  useEffect(() => {
    if (position && onLocationGranted) {
      onLocationGranted(position.lat, position.lng);
      setOpen(false);
    }
  }, [position, onLocationGranted]);

  const handleAllow = () => {
    requestPermission();
  };

  const handleDismiss = () => {
    sessionStorage.setItem("location-dismissed", "true");
    setOpen(false);
  };

  if (permissionState === "granted") return null;

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
            <Navigation className="h-10 w-10 text-accent" />
          </motion.div>
          <DialogTitle className="font-heading text-xl">Enable Location Services</DialogTitle>
          <DialogDescription className="mt-2">
            Allow ShipSwift to access your location for accurate pickup points, real-time tracking, and distance calculation.
          </DialogDescription>
        </DialogHeader>

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

        {error && (
          <p className="mt-2 text-sm text-destructive text-center">{error}</p>
        )}

        <div className="mt-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleDismiss}>
            Not Now
          </Button>
          <Button className="flex-1 gap-2" onClick={handleAllow} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            Allow Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
