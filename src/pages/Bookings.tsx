import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockBookings } from "@/lib/mock-data";
import { Package } from "lucide-react";

export default function Bookings() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <h1 className="font-heading text-3xl font-bold">My Bookings</h1>
        <p className="mt-2 text-muted-foreground">Track and manage all your shipments</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-sm font-medium">{b.id}</TableCell>
                      <TableCell>{b.vehicleType}</TableCell>
                      <TableCell className="text-sm">{b.pickup} → {b.drop}</TableCell>
                      <TableCell className="text-sm">{b.date}</TableCell>
                      <TableCell className="font-medium">₹{b.price.toLocaleString()}</TableCell>
                      <TableCell><StatusBadge status={b.status} /></TableCell>
                      <TableCell>
                        <Badge variant={b.paymentStatus === "success" ? "default" : b.paymentStatus === "pending" ? "secondary" : "destructive"} className="text-xs">
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
      </div>
    </div>
  );
}
