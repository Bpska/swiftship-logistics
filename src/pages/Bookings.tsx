import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapView } from "@/components/MapView";
import { Package, Loader2, Inbox, MapPin, Calendar, Truck, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type Booking = Tables<"bookings">;

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setBookings(data);
      setLoading(false);
    };
    fetchBookings();

    const channel = supabase
      .channel("bookings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6 md:py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold md:text-3xl">My Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground md:mt-2">Track and manage all your shipments</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Inbox className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">No bookings yet</p>
            <p className="text-sm">Your bookings will appear here once you make one.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            {/* Booking cards - mobile first */}
            <div className="space-y-3 lg:col-span-3">
              {bookings.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer border transition-all duration-200 hover:shadow-md ${selectedBooking?.id === b.id ? "border-primary ring-1 ring-primary/20 shadow-md" : ""}`}
                    onClick={() => setSelectedBooking(b)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-primary">{b.booking_number}</span>
                            <StatusBadge status={b.status} />
                          </div>
                          <p className="mt-2 text-sm font-medium">{b.vehicle_type}</p>
                          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{b.pickup} → {b.drop_location}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(b.pickup_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              {b.distance} km
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-heading text-lg font-bold">₹{Number(b.total_price).toLocaleString()}</p>
                          <Badge variant={b.payment_status === "success" ? "default" : b.payment_status === "pending" ? "secondary" : "destructive"} className="mt-1 text-xs">
                            {b.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Map view */}
            <div className="lg:col-span-2">
              <div className="sticky top-20">
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      {selectedBooking ? `Route: ${selectedBooking.booking_number}` : "Select a booking to view route"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <MapView
                      markers={
                        selectedBooking
                          ? [
                              { lat: 19.076 + Math.random() * 2, lng: 72.877 + Math.random() * 2, label: `Pickup: ${selectedBooking.pickup}`, type: "pickup" },
                              { lat: 19.076 + Math.random() * 2, lng: 72.877 + Math.random() * 2, label: `Drop: ${selectedBooking.drop_location}`, type: "drop" },
                            ]
                          : []
                      }
                      className="h-[300px] lg:h-[500px] rounded-none"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
