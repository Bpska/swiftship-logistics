import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { MapPin, Calendar, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GST_RATE = 0.18;
const BASE_FARE = 50;

interface Vehicle {
  id: string;
  type: string;
  name: string;
  capacity: string;
  rate_per_km: number;
  icon: string;
  description: string | null;
}

export default function BookVehicle() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState("");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase.from("vehicles").select("id, type, name, capacity, rate_per_km, icon, description").eq("status", "available");
      if (data) setVehicles(data);
      setLoadingVehicles(false);
    };
    fetchVehicles();
  }, []);

  const vehicle = vehicles.find((v) => v.id === selected);
  const mockDistance = pickup && drop ? Math.floor(Math.random() * 50) + 10 : 0;
  const distanceCharge = vehicle ? mockDistance * vehicle.rate_per_km : 0;
  const subtotal = BASE_FARE + distanceCharge;
  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;

  const handleConfirm = async () => {
    if (!user || !vehicle) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        vehicle_id: vehicle.id,
        vehicle_type: vehicle.name,
        pickup,
        drop_location: drop,
        pickup_date: new Date(date).toISOString(),
        distance: mockDistance,
        base_fare: BASE_FARE,
        distance_charge: distanceCharge,
        gst: Math.round(gst),
        total_price: Math.round(total),
        status: "pending",
        payment_status: "pending",
      });
      if (error) throw error;

      // Also create a payment record
      toast.success("Booking confirmed! Redirecting to your bookings...", { duration: 2000 });
      setTimeout(() => navigate("/bookings"), 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ["Select Vehicle", "Enter Details", "Confirm & Pay"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-3xl font-bold">Book a Vehicle</h1>
          <p className="mt-2 text-muted-foreground">Select your vehicle and enter shipment details</p>
        </motion.div>

        {/* Progress */}
        <div className="mt-8 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                animate={{ scale: step === s ? 1.1 : 1 }}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                  step >= s ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </motion.div>
              {s < 3 && (
                <div className="relative h-0.5 w-12 bg-muted overflow-hidden rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: step > s ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-y-0 left-0 bg-primary"
                  />
                </div>
              )}
            </div>
          ))}
          <span className="ml-3 text-sm font-medium text-muted-foreground">{stepLabels[step - 1]}</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mt-8">
              {loadingVehicles ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {vehicles.map((v, i) => (
                    <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <Card
                        onClick={() => setSelected(v.id)}
                        className={`cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
                          selected === v.id ? "border-accent ring-2 ring-accent/30 shadow-lg shadow-accent/10" : "hover:border-accent/50 hover:shadow-md"
                        }`}
                      >
                        <CardContent className="flex flex-col items-center p-6 text-center">
                          <span className="text-5xl drop-shadow-sm">{v.icon}</span>
                          <h3 className="mt-3 font-heading text-lg font-semibold">{v.name}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">{v.description}</p>
                          <div className="mt-3 flex items-center gap-3 text-xs">
                            <span className="rounded-full bg-muted px-3 py-1 font-medium">{v.capacity}</span>
                            <span className="rounded-full bg-accent/10 px-3 py-1 font-semibold text-accent">₹{v.rate_per_km}/km</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  <div className="col-span-full mt-4">
                    <Button onClick={() => selected && setStep(2)} disabled={!selected} className="w-full sm:w-auto shadow-lg shadow-primary/20">
                      Continue <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mt-8 max-w-lg">
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{vehicle?.icon}</span> {vehicle?.name} — Enter Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="pickup">Pickup Location</Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-accent" />
                      <Input id="pickup" placeholder="e.g. Mumbai Central" value={pickup} onChange={(e) => setPickup(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="drop">Drop Location</Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-destructive" />
                      <Input id="drop" placeholder="e.g. Andheri West" value={drop} onChange={(e) => setDrop(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="date">Pickup Date & Time</Label>
                    <div className="relative mt-1.5">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={() => pickup && drop && date && setStep(3)} disabled={!pickup || !drop || !date} className="flex-1">
                      Get Quote <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="mt-8 max-w-lg">
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2.5">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vehicle</span><span className="font-medium">{vehicle?.icon} {vehicle?.name}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pickup</span><span className="font-medium">{pickup}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Drop</span><span className="font-medium">{drop}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="font-medium">{new Date(date).toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Est. Distance</span><span className="font-medium">{mockDistance} km</span></div>
                  </div>
                  <hr />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Base Fare</span><span>₹{BASE_FARE}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Distance ({mockDistance} km × ₹{vehicle?.rate_per_km})</span><span>₹{distanceCharge}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST (18%)</span><span>₹{gst.toFixed(0)}</span></div>
                  </div>
                  <hr />
                  <div className="flex justify-between text-xl font-bold"><span>Total</span><span className="text-primary">₹{total.toFixed(0)}</span></div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button onClick={handleConfirm} disabled={submitting} className="flex-1 shadow-lg shadow-primary/20">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Confirm & Pay ₹${total.toFixed(0)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
