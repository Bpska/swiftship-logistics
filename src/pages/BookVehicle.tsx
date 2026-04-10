import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { vehicleTypes } from "@/lib/mock-data";
import { toast } from "sonner";
import { MapPin, Calendar, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const GST_RATE = 0.18;
const BASE_FARE = 50;

export default function BookVehicle() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState("");
  const [step, setStep] = useState(1);

  const vehicle = vehicleTypes.find((v) => v.id === selected);
  const mockDistance = pickup && drop ? Math.floor(Math.random() * 50) + 10 : 0;
  const subtotal = vehicle ? BASE_FARE + mockDistance * vehicle.ratePerKm : 0;
  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;

  const handleConfirm = () => {
    toast.success("Booking confirmed! Redirecting to your bookings...", { duration: 2000 });
    setTimeout(() => navigate("/bookings"), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <h1 className="font-heading text-3xl font-bold">Book a Vehicle</h1>
        <p className="mt-2 text-muted-foreground">Select your vehicle and enter shipment details</p>

        {/* Progress */}
        <div className="mt-8 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-12 ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
          <span className="ml-3 text-sm text-muted-foreground">
            {step === 1 ? "Select Vehicle" : step === 2 ? "Enter Details" : "Confirm & Pay"}
          </span>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vehicleTypes.map((v) => (
              <Card
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`cursor-pointer transition-all ${selected === v.id ? "border-accent ring-2 ring-accent/30" : "hover:border-accent/50"}`}
              >
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <span className="text-4xl">{v.icon}</span>
                  <h3 className="mt-3 font-heading text-lg font-semibold">{v.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{v.capacity} • ₹{v.ratePerKm}/km</p>
                </CardContent>
              </Card>
            ))}
            <div className="col-span-full mt-4">
              <Button onClick={() => selected && setStep(2)} disabled={!selected} className="w-full sm:w-auto">
                Continue <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 max-w-lg">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{vehicle?.icon}</span> {vehicle?.name} — Enter Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="pickup" placeholder="e.g. Mumbai Central" value={pickup} onChange={(e) => setPickup(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="drop">Drop Location</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="drop" placeholder="e.g. Andheri West" value={drop} onChange={(e) => setDrop(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="date">Pickup Date & Time</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => pickup && drop && date && setStep(3)} disabled={!pickup || !drop || !date}>
                    Get Quote <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 max-w-lg">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vehicle</span><span className="font-medium">{vehicle?.icon} {vehicle?.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Pickup</span><span className="font-medium">{pickup}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Drop</span><span className="font-medium">{drop}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="font-medium">{new Date(date).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Est. Distance</span><span className="font-medium">{mockDistance} km</span></div>
                <hr className="my-2" />
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Base Fare</span><span>₹{BASE_FARE}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Distance Charge ({mockDistance} km × ₹{vehicle?.ratePerKm})</span><span>₹{mockDistance * (vehicle?.ratePerKm || 0)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST (18%)</span><span>₹{gst.toFixed(0)}</span></div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary">₹{total.toFixed(0)}</span></div>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={handleConfirm} className="flex-1">
                    Confirm & Pay ₹{total.toFixed(0)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
