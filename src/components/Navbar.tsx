import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Truck } from "lucide-react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Book Now", to: "/book" },
  { label: "My Bookings", to: "/bookings" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
          <Truck className="h-6 w-6" />
          ShipSwift
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/login">
            <Button variant="outline" size="sm">Log In</Button>
          </Link>
          <Link to="/admin">
            <Button size="sm">Admin</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">
                {l.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">Log In</Button>
            </Link>
            <Link to="/admin" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full">Admin</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
