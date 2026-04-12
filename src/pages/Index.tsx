import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import { MapPin, Clock, Shield, Truck, ArrowRight, CheckCircle, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Vehicle {
  id: string; name: string; capacity: string; rate_per_km: number; icon: string; description: string | null;
}

const features = [
  { icon: MapPin, title: "Live Tracking", desc: "Track your shipment in real-time from pickup to delivery" },
  { icon: Clock, title: "Quick Booking", desc: "Book a vehicle in under 2 minutes with instant pricing" },
  { icon: Shield, title: "Secure & Insured", desc: "All shipments are fully insured for your peace of mind" },
  { icon: Truck, title: "Fleet Variety", desc: "From mini trucks to containers — we have it all" },
];

const steps = [
  { step: "01", title: "Choose Vehicle", desc: "Select the right vehicle for your cargo size", icon: Truck },
  { step: "02", title: "Enter Locations", desc: "Set pickup and drop-off locations", icon: MapPin },
  { step: "03", title: "Get Instant Quote", desc: "See transparent pricing before you confirm", icon: Zap },
  { step: "04", title: "Track & Receive", desc: "Monitor your shipment until delivery", icon: CheckCircle },
];

const stats = [
  { value: "10K+", label: "Shipments Delivered" },
  { value: "500+", label: "Active Vehicles" },
  { value: "50+", label: "Cities Covered" },
  { value: "4.8★", label: "Customer Rating" },
];

export default function Index() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    supabase.from("vehicles").select("id, name, capacity, rate_per_km, icon, description").then(({ data }) => {
      if (data) setVehicles(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-24 md:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.1),transparent_60%)]" />
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent"
            >
              <Star className="h-3.5 w-3.5" /> Trusted by 10,000+ businesses
            </motion.div>
            <h1 className="font-heading text-4xl font-bold leading-tight text-primary-foreground md:text-6xl lg:text-7xl">
              Move Goods,{" "}
              <span className="relative">
                <span className="text-accent">Not Mountains</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-accent/30 origin-left"
                />
              </span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/70 md:text-xl leading-relaxed">
              India's smartest logistics platform. Book verified transport vehicles instantly with transparent pricing and real-time tracking.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/book">
                <Button variant="hero" size="lg" className="text-base px-8 h-12">
                  Book a Vehicle <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/bookings">
                <Button variant="hero-outline" size="lg" className="text-base px-8 h-12">
                  Track Shipment
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="container relative z-10 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mx-auto grid max-w-3xl grid-cols-2 gap-4 rounded-2xl bg-primary-foreground/10 p-6 backdrop-blur-sm md:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-heading text-2xl font-bold text-primary-foreground md:text-3xl">{s.value}</p>
                <p className="text-xs text-primary-foreground/60 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">Why Choose Us</span>
            <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">Built for Modern Logistics</h2>
          </motion.div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 group-hover:from-accent/30 transition-colors">
                      <f.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Types from DB */}
      <section className="bg-muted/40 py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">Our Fleet</span>
            <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">Choose Your Vehicle</h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">Pick the perfect vehicle for your cargo needs</p>
          </motion.div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {vehicles.map((v, i) => (
              <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to="/book">
                  <Card className="group h-full border-0 shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="flex flex-col items-center p-8 text-center">
                      <span className="text-5xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{v.icon}</span>
                      <h3 className="mt-4 font-heading text-lg font-semibold">{v.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
                      <div className="mt-4 flex items-center gap-3 text-xs">
                        <span className="rounded-full bg-muted px-3 py-1 font-medium">{v.capacity}</span>
                        <span className="rounded-full bg-accent/10 px-3 py-1 font-semibold text-accent">₹{Number(v.rate_per_km)}/km</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">How It Works</span>
            <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">Simple. Fast. Reliable.</h2>
          </motion.div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                  <s.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="mt-4 block text-xs font-bold uppercase tracking-widest text-accent">{s.step}</span>
                <h3 className="mt-2 font-heading text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-primary py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.1),transparent_70%)]" />
        <div className="container relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">Ready to Ship?</h2>
            <p className="mt-4 text-lg text-primary-foreground/70">Get started in minutes. No contracts, no hidden fees.</p>
            <Link to="/book">
              <Button variant="hero" size="lg" className="mt-8 text-base px-8 h-12">
                Book Your First Shipment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-heading text-lg font-bold text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            ShipSwift
          </div>
          <p className="text-sm text-muted-foreground">© 2026 ShipSwift Logistics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
