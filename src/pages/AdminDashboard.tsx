import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MapView } from "@/components/MapView";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, Package, IndianRupee, Truck, LayoutDashboard, BookOpen, CarFront, CreditCard, Menu, LogOut, Loader2, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type Booking = Tables<"bookings">;
type Vehicle = Tables<"vehicles">;
type Profile = Tables<"profiles">;
type BookingStatus = Database["public"]["Enums"]["booking_status"];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: BookOpen, label: "Bookings", key: "bookings" },
  { icon: Users, label: "Users", key: "users" },
  { icon: CarFront, label: "Vehicles", key: "vehicles" },
  { icon: CreditCard, label: "Payments", key: "payments" },
  { icon: MapPin, label: "Live Map", key: "map" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [bRes, vRes, pRes] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("vehicles").select("*"),
      supabase.from("profiles").select("*"),
    ]);
    if (bRes.data) setBookings(bRes.data);
    if (vRes.data) setVehicles(vRes.data);
    if (pRes.data) setProfiles(pRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Real-time for admin
    const channel = supabase
      .channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalRevenue = bookings.filter(b => b.payment_status === "success").reduce((s, b) => s + Number(b.total_price), 0);
  const activeVehicles = vehicles.filter(v => v.status === "available").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const inTransit = bookings.filter(b => b.status === "in_transit").length;

  const kpis = [
    { icon: Users, label: "Total Users", value: profiles.length.toString(), color: "text-info", bg: "bg-info/10" },
    { icon: Package, label: "Total Bookings", value: bookings.length.toString(), color: "text-secondary", bg: "bg-secondary/10" },
    { icon: IndianRupee, label: "Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}K`, color: "text-success", bg: "bg-success/10" },
    { icon: Truck, label: "Active Vehicles", value: activeVehicles.toString(), color: "text-warning", bg: "bg-warning/10" },
  ];

  const chartData = bookings.reduce<Record<string, { day: string; bookings: number; revenue: number }>>((acc, b) => {
    const day = new Date(b.created_at).toLocaleDateString("en-US", { weekday: "short" });
    if (!acc[day]) acc[day] = { day, bookings: 0, revenue: 0 };
    acc[day].bookings++;
    acc[day].revenue += Number(b.total_price);
    return acc;
  }, {});
  const revenueData = Object.values(chartData).slice(0, 7);

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
    if (error) { toast.error("Failed to update status"); return; }
    toast.success(`Status updated to ${status.replace("_", " ")}`);
    fetchData();
  };

  // Map markers from active bookings
  const mapMarkers = bookings
    .filter(b => b.status === "in_transit" || b.status === "confirmed")
    .slice(0, 20)
    .flatMap((b, i) => [
      { lat: 19.076 + (i * 0.5), lng: 72.877 + (i * 0.3), label: `${b.booking_number}: ${b.pickup}`, type: "pickup" as const },
      { lat: 19.076 + (i * 0.5) + 1, lng: 72.877 + (i * 0.3) + 1, label: `${b.booking_number}: ${b.drop_location}`, type: "drop" as const },
    ]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar text-sidebar-foreground transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4 md:h-16 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Truck className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold">Admin</span>
          </div>
          <button className="md:hidden rounded-lg p-1 hover:bg-sidebar-accent/50" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-3 space-y-0.5 px-3">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                activeTab === item.key ? "bg-sidebar-accent text-sidebar-primary shadow-sm" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.key === "bookings" && pendingBookings > 0 && (
                <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground px-1.5">
                  {pendingBookings}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
              <LogOut className="h-4 w-4" /> Exit Admin
            </Button>
          </Link>
        </div>
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-xl md:h-16 md:px-6">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
          <h2 className="font-heading text-base font-semibold capitalize md:text-lg">{activeTab === "map" ? "Live Map" : activeTab}</h2>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{pendingBookings} pending</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{inTransit} in transit</span>
          </div>
        </header>

        <main className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <div className="space-y-4 md:space-y-6">
                  <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 md:gap-4">
                    {kpis.map((k, i) => (
                      <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="flex items-center gap-3 p-4 md:gap-4 md:p-6">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${k.bg} ${k.color} md:h-12 md:w-12`}>
                              <k.icon className="h-5 w-5 md:h-6 md:w-6" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground md:text-sm">{k.label}</p>
                              <p className="text-lg font-bold font-heading md:text-2xl">{k.value}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2 md:gap-6">
                    <Card className="border-0 shadow-md">
                      <CardHeader className="pb-2"><CardTitle className="text-sm md:text-base">Bookings Overview</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                            <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md">
                      <CardHeader className="pb-2"><CardTitle className="text-sm md:text-base">Revenue Trend</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={220}>
                          <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ fill: "hsl(var(--accent))", strokeWidth: 0, r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-0 shadow-md">
                    <CardHeader className="pb-2"><CardTitle className="text-sm md:text-base">Recent Bookings</CardTitle></CardHeader>
                    <CardContent>
                      <MobileBookingsList bookings={bookings.slice(0, 5)} onStatusChange={updateBookingStatus} profiles={profiles} />
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "bookings" && (
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle className="text-sm md:text-base">All Bookings ({bookings.length})</CardTitle></CardHeader>
                  <CardContent>
                    <MobileBookingsList bookings={bookings} onStatusChange={updateBookingStatus} profiles={profiles} />
                  </CardContent>
                </Card>
              )}

              {activeTab === "users" && (
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle className="text-sm md:text-base">User Management ({profiles.length})</CardTitle></CardHeader>
                  <CardContent>
                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                      {profiles.map((u) => (
                        <div key={u.id} className="flex items-center gap-3 rounded-lg border p-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {(u.full_name || "?")[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{u.full_name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{u.phone || "No phone"}</p>
                          </div>
                          <p className="text-xs text-muted-foreground shrink-0">{new Date(u.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Joined</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                          {profiles.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                              <TableCell>{u.phone || "—"}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "vehicles" && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-sm md:text-base">Vehicle Management ({vehicles.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Mobile cards */}
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:hidden">
                      {vehicles.map((v) => (
                        <Card key={v.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{v.icon}</span>
                              <div>
                                <p className="font-medium text-sm">{v.name}</p>
                                <p className="text-xs text-muted-foreground">{v.type} · {v.capacity}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-sm font-semibold text-accent">₹{Number(v.rate_per_km)}/km</span>
                              <Badge variant={v.status === "available" ? "default" : v.status === "in_use" ? "secondary" : "destructive"}>
                                {v.status.replace("_", " ")}
                              </Badge>
                            </div>
                            {v.plate_number && <p className="mt-2 text-xs font-mono text-muted-foreground">{v.plate_number}</p>}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Vehicle</TableHead><TableHead>Type</TableHead><TableHead>Capacity</TableHead><TableHead>Rate/km</TableHead><TableHead>Plate</TableHead><TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {vehicles.map((v) => (
                            <TableRow key={v.id}>
                              <TableCell className="font-medium">{v.icon} {v.name}</TableCell>
                              <TableCell>{v.type}</TableCell>
                              <TableCell>{v.capacity}</TableCell>
                              <TableCell>₹{Number(v.rate_per_km)}</TableCell>
                              <TableCell className="font-mono text-sm">{v.plate_number || "—"}</TableCell>
                              <TableCell>
                                <Badge variant={v.status === "available" ? "default" : v.status === "in_use" ? "secondary" : "destructive"}>
                                  {v.status.replace("_", " ")}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "payments" && (
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle className="text-sm md:text-base">Payment Transactions</CardTitle></CardHeader>
                  <CardContent>
                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                      {bookings.map((b) => {
                        const profile = profiles.find(p => p.user_id === b.user_id);
                        return (
                          <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-mono text-muted-foreground">{b.booking_number}</p>
                              <p className="text-sm font-medium truncate">{profile?.full_name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="font-semibold">₹{Number(b.total_price).toLocaleString()}</p>
                              <Badge variant={b.payment_status === "success" ? "default" : b.payment_status === "pending" ? "secondary" : "destructive"} className="mt-1 text-xs">
                                {b.payment_status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Booking</TableHead><TableHead>Customer</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((b) => {
                            const profile = profiles.find(p => p.user_id === b.user_id);
                            return (
                              <TableRow key={b.id}>
                                <TableCell className="font-mono text-sm">{b.booking_number}</TableCell>
                                <TableCell>{profile?.full_name || "—"}</TableCell>
                                <TableCell className="font-semibold">₹{Number(b.total_price).toLocaleString()}</TableCell>
                                <TableCell className="text-sm">{new Date(b.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge variant={b.payment_status === "success" ? "default" : b.payment_status === "pending" ? "secondary" : "destructive"}>
                                    {b.payment_status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "map" && (
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                      <MapPin className="h-4 w-4 text-primary" /> Active Shipments Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <MapView
                      markers={mapMarkers}
                      className="h-[400px] md:h-[600px] rounded-none rounded-b-lg"
                    />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Mobile-first bookings list component
function MobileBookingsList({ bookings, onStatusChange, profiles }: { bookings: Booking[]; onStatusChange: (id: string, status: BookingStatus) => void; profiles: Profile[] }) {
  const statuses: BookingStatus[] = ["pending", "confirmed", "in_transit", "delivered", "cancelled"];

  return (
    <>
      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {bookings.map((b) => {
          const profile = profiles.find(p => p.user_id === b.user_id);
          return (
            <div key={b.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary">{b.booking_number}</span>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{profile?.full_name || "—"}</span>
                <span className="font-semibold">₹{Number(b.total_price).toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {b.pickup} → {b.drop_location}
              </p>
              <Select value={b.status} onValueChange={(v) => onStatusChange(b.id, v as BookingStatus)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(s => (
                    <SelectItem key={s} value={s} className="text-xs">{s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead><TableHead>Customer</TableHead><TableHead>Vehicle</TableHead><TableHead>Route</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => {
              const profile = profiles.find(p => p.user_id === b.user_id);
              return (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-sm">{b.booking_number}</TableCell>
                  <TableCell>{profile?.full_name || "—"}</TableCell>
                  <TableCell>{b.vehicle_type}</TableCell>
                  <TableCell className="text-sm">{b.pickup} → {b.drop_location}</TableCell>
                  <TableCell className="font-semibold">₹{Number(b.total_price).toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                  <TableCell>
                    <Select value={b.status} onValueChange={(v) => onStatusChange(b.id, v as BookingStatus)}>
                      <SelectTrigger className="h-8 w-[130px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => (
                          <SelectItem key={s} value={s} className="text-xs">{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
