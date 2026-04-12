import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, Package, IndianRupee, Truck, LayoutDashboard, BookOpen, CarFront, CreditCard, Menu, LogOut, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
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

  useEffect(() => { fetchData(); }, []);

  const totalRevenue = bookings.filter(b => b.payment_status === "success").reduce((s, b) => s + Number(b.total_price), 0);
  const activeVehicles = vehicles.filter(v => v.status === "available").length;

  const kpis = [
    { icon: Users, label: "Total Users", value: profiles.length.toString(), color: "text-info" },
    { icon: Package, label: "Total Bookings", value: bookings.length.toString(), color: "text-secondary" },
    { icon: IndianRupee, label: "Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}K`, color: "text-success" },
    { icon: Truck, label: "Active Vehicles", value: activeVehicles.toString(), color: "text-warning" },
  ];

  // Group bookings by day for charts
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

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar text-sidebar-foreground transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Truck className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold">Admin</span>
        </div>
        <nav className="mt-4 space-y-1 px-3">
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

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-card/80 px-6 backdrop-blur-xl">
          <button className="mr-4 md:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
          <h2 className="font-heading text-lg font-semibold capitalize">{activeTab}</h2>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {kpis.map((k, i) => (
                      <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="flex items-center gap-4 p-6">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${k.color}`}>
                              <k.icon className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">{k.label}</p>
                              <p className="text-2xl font-bold font-heading">{k.value}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="border-0 shadow-md">
                      <CardHeader><CardTitle>Bookings Overview</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                            <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md">
                      <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ fill: "hsl(var(--accent))", strokeWidth: 0, r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-0 shadow-md">
                    <CardHeader><CardTitle>Recent Bookings</CardTitle></CardHeader>
                    <CardContent>
                      <AdminBookingsTable bookings={bookings.slice(0, 5)} onStatusChange={updateBookingStatus} profiles={profiles} />
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "bookings" && (
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle>All Bookings</CardTitle></CardHeader>
                  <CardContent>
                    <AdminBookingsTable bookings={bookings} onStatusChange={updateBookingStatus} profiles={profiles} />
                  </CardContent>
                </Card>
              )}

              {activeTab === "users" && (
                <Card className="border-0 shadow-md">
                  <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Joined</TableHead>
                          </TableRow>
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
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Vehicle Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
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
                  <CardHeader><CardTitle>Payment Transactions</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function AdminBookingsTable({ bookings, onStatusChange, profiles }: { bookings: Booking[]; onStatusChange: (id: string, status: BookingStatus) => void; profiles: Profile[] }) {
  const statuses: BookingStatus[] = ["pending", "confirmed", "in_transit", "delivered", "cancelled"];
  return (
    <div className="overflow-x-auto">
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
  );
}
