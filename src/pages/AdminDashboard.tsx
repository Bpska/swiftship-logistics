import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { dashboardStats, mockBookings, revenueData } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, Package, IndianRupee, Truck, LayoutDashboard, BookOpen, CarFront, CreditCard, Menu, X, LogOut } from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: BookOpen, label: "Bookings", key: "bookings" },
  { icon: Users, label: "Users", key: "users" },
  { icon: CarFront, label: "Vehicles", key: "vehicles" },
  { icon: CreditCard, label: "Payments", key: "payments" },
];

const kpis = [
  { icon: Users, label: "Total Users", value: dashboardStats.totalUsers.toLocaleString(), color: "text-info" },
  { icon: Package, label: "Total Bookings", value: dashboardStats.totalBookings.toLocaleString(), color: "text-secondary" },
  { icon: IndianRupee, label: "Revenue", value: `₹${(dashboardStats.totalRevenue / 100000).toFixed(1)}L`, color: "text-success" },
  { icon: Truck, label: "Active Vehicles", value: dashboardStats.activeVehicles.toString(), color: "text-warning" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar text-sidebar-foreground transition-transform md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <Truck className="h-6 w-6 text-sidebar-primary" />
          <span className="font-heading text-lg font-bold">ShipSwift Admin</span>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === item.key ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
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

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-foreground/20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-card/80 px-6 backdrop-blur-md">
          <button className="mr-4 md:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
          <h2 className="font-heading text-lg font-semibold capitalize">{activeTab}</h2>
        </header>

        <main className="p-6">
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "bookings" && <BookingsView />}
          {activeTab === "users" && <UsersView />}
          {activeTab === "vehicles" && <VehiclesView />}
          {activeTab === "payments" && <PaymentsView />}
        </main>
      </div>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${k.color}`}>
                <k.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{k.label}</p>
                <p className="text-2xl font-bold font-heading">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Bookings This Week</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Bookings</CardTitle></CardHeader>
        <CardContent>
          <BookingsTable bookings={mockBookings.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  );
}

function BookingsView() {
  return (
    <Card>
      <CardHeader><CardTitle>All Bookings</CardTitle></CardHeader>
      <CardContent><BookingsTable bookings={mockBookings} /></CardContent>
    </Card>
  );
}

function BookingsTable({ bookings }: { bookings: typeof mockBookings }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-mono text-sm">{b.id}</TableCell>
              <TableCell>{b.userName}</TableCell>
              <TableCell>{b.vehicleType}</TableCell>
              <TableCell className="text-sm">{b.pickup} → {b.drop}</TableCell>
              <TableCell className="font-medium">₹{b.price.toLocaleString()}</TableCell>
              <TableCell><StatusBadge status={b.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function UsersView() {
  const users = [
    { name: "Rahul Sharma", email: "rahul@email.com", phone: "+91 98765 43210", bookings: 12, status: "active" },
    { name: "Priya Patel", email: "priya@email.com", phone: "+91 87654 32100", bookings: 8, status: "active" },
    { name: "Amit Kumar", email: "amit@email.com", phone: "+91 76543 21000", bookings: 5, status: "active" },
    { name: "Sneha Gupta", email: "sneha@email.com", phone: "+91 65432 10000", bookings: 3, status: "blocked" },
  ];
  return (
    <Card>
      <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Bookings</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.email}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone}</TableCell>
                  <TableCell>{u.bookings}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "default" : "destructive"}>{u.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function VehiclesView() {
  const vehicles = [
    { id: "V-001", type: "Mini Truck", plate: "MH 01 AB 1234", capacity: "500 kg", rate: 12, status: "available" },
    { id: "V-002", type: "Pickup", plate: "MH 02 CD 5678", capacity: "1 ton", rate: 18, status: "in_use" },
    { id: "V-003", type: "Lorry", plate: "KA 03 EF 9012", capacity: "5 tons", rate: 28, status: "available" },
    { id: "V-004", type: "Container", plate: "DL 04 GH 3456", capacity: "20 tons", rate: 45, status: "maintenance" },
  ];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Vehicle Management</CardTitle>
        <Button size="sm">Add Vehicle</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Type</TableHead><TableHead>Plate</TableHead><TableHead>Capacity</TableHead><TableHead>Rate/km</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono">{v.id}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell>{v.plate}</TableCell>
                  <TableCell>{v.capacity}</TableCell>
                  <TableCell>₹{v.rate}</TableCell>
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
  );
}

function PaymentsView() {
  return (
    <Card>
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
              {mockBookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono">{b.id}</TableCell>
                  <TableCell>{b.userName}</TableCell>
                  <TableCell className="font-medium">₹{b.price.toLocaleString()}</TableCell>
                  <TableCell>{b.date}</TableCell>
                  <TableCell>
                    <Badge variant={b.paymentStatus === "success" ? "default" : b.paymentStatus === "pending" ? "secondary" : "destructive"}>
                      {b.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
