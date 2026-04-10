export const vehicleTypes = [
  { id: "mini-truck", name: "Mini Truck", capacity: "500 kg", ratePerKm: 12, icon: "🚚", description: "Perfect for small loads and city deliveries" },
  { id: "pickup", name: "Pickup", capacity: "1 ton", ratePerKm: 18, icon: "🛻", description: "Ideal for medium-sized goods and furniture" },
  { id: "lorry", name: "Lorry", capacity: "5 tons", ratePerKm: 28, icon: "🚛", description: "Heavy-duty transport for large shipments" },
  { id: "container", name: "Container", capacity: "20 tons", ratePerKm: 45, icon: "📦", description: "Full container for bulk and industrial goods" },
];

export type BookingStatus = "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";

export interface Booking {
  id: string;
  vehicleType: string;
  pickup: string;
  drop: string;
  date: string;
  distance: number;
  price: number;
  status: BookingStatus;
  paymentStatus: "success" | "pending" | "failed";
  createdAt: string;
  userName?: string;
}

export const mockBookings: Booking[] = [
  { id: "BK-001", vehicleType: "Mini Truck", pickup: "Mumbai Central", drop: "Andheri West", date: "2026-04-08", distance: 18, price: 356, status: "delivered", paymentStatus: "success", createdAt: "2026-04-08T10:30:00Z", userName: "Rahul Sharma" },
  { id: "BK-002", vehicleType: "Lorry", pickup: "Pune Station", drop: "Hinjewadi IT Park", date: "2026-04-09", distance: 22, price: 816, status: "in_transit", paymentStatus: "success", createdAt: "2026-04-09T08:15:00Z", userName: "Priya Patel" },
  { id: "BK-003", vehicleType: "Pickup", pickup: "Bangalore MG Road", drop: "Electronic City", date: "2026-04-10", distance: 30, price: 690, status: "confirmed", paymentStatus: "success", createdAt: "2026-04-10T06:00:00Z", userName: "Amit Kumar" },
  { id: "BK-004", vehicleType: "Container", pickup: "Delhi NCR", drop: "Jaipur Industrial", date: "2026-04-10", distance: 280, price: 13260, status: "pending", paymentStatus: "pending", createdAt: "2026-04-10T12:00:00Z", userName: "Sneha Gupta" },
  { id: "BK-005", vehicleType: "Mini Truck", pickup: "Chennai T Nagar", drop: "OMR Thoraipakkam", date: "2026-04-07", distance: 15, price: 320, status: "cancelled", paymentStatus: "failed", createdAt: "2026-04-07T14:30:00Z", userName: "Vikram Singh" },
];

export const dashboardStats = {
  totalUsers: 1247,
  totalBookings: 3842,
  totalRevenue: 2847500,
  activeVehicles: 156,
};

export const revenueData = [
  { day: "Mon", bookings: 45, revenue: 32000 },
  { day: "Tue", bookings: 52, revenue: 41000 },
  { day: "Wed", bookings: 38, revenue: 28000 },
  { day: "Thu", bookings: 61, revenue: 53000 },
  { day: "Fri", bookings: 55, revenue: 48000 },
  { day: "Sat", bookings: 72, revenue: 64000 },
  { day: "Sun", bookings: 33, revenue: 24000 },
];
