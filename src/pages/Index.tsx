import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { vehicleTypes } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { MapPin, Clock, Shield, Truck, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: MapPin, title: "Live Tracking", desc: "Track your shipment in real-time from pickup to delivery" },
  { icon: Clock, title: "Quick Booking", desc: "Book a vehicle in under 2 minutes with instant pricing" },
  { icon: Shield, title: "Secure & Insured", desc: "All shipments are fully insured for your peace of mind" },
  { icon: Truck, title: "Fleet Variety", desc: "From mini trucks to containers — we have it all" },
];

const steps = [
  { step: "01", title: "Choose Vehicle", desc: "Select the right vehicle for your cargo size" },
  { step: "02", title: "Enter Locations", desc: "Set pickup and drop-off with map autocomplete" },
  { step: "03", title: "Get Instant Quote", desc: "See transparent pricing before you confirm" },
  { step: "04", title: "Track & Receive", desc: "Monitor your shipment until delivery" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.15),transparent_60%)]" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="font-heading text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
              Move Goods,{" "}
              <span className="text-accent">Not Mountains</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/70">
              India's smartest logistics platform. Book verified transport vehicles instantly with transparent pricing and real-time tracking.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/book">
                <Button variant="hero" size="lg" className="text-base">
                  Book a Vehicle <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/bookings">
                <Button variant="hero-outline" size="lg" className="text-base">
                  Track Shipment
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-center font-heading text-3xl font-bold">Why Choose ShipSwift?</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <f.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Types */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <h2 className="text-center font-heading text-3xl font-bold">Our Fleet</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">Choose the perfect vehicle for your cargo needs</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {vehicleTypes.map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="group h-full cursor-pointer border hover:border-accent hover:shadow-lg transition-all">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <span className="text-5xl">{v.icon}</span>
                    <h3 className="mt-4 font-heading text-lg font-semibold">{v.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-3 py-1">{v.capacity}</span>
                      <span className="rounded-full bg-muted px-3 py-1">₹{v.ratePerKm}/km</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-center font-heading text-3xl font-bold">How It Works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary font-heading text-xl font-bold text-primary-foreground">
                  {s.step}
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container text-center">
          <h2 className="font-heading text-3xl font-bold text-primary-foreground">Ready to Ship?</h2>
          <p className="mt-3 text-primary-foreground/70">Get started in minutes. No contracts, no hidden fees.</p>
          <Link to="/book">
            <Button variant="hero" size="lg" className="mt-8 text-base">
              Book Your First Shipment <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
            <Truck className="h-5 w-5" /> ShipSwift
          </div>
          <p className="text-sm text-muted-foreground">© 2026 ShipSwift Logistics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
