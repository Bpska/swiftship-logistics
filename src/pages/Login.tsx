import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await signUp(form.email, form.password, form.name, form.phone);
        toast.success("Account created successfully! You're now logged in.");
      } else {
        await signIn(form.email, form.password);
        toast.success("Welcome back!");
      }
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <Link to="/" className="mx-auto mb-4 flex items-center gap-2 font-heading text-2xl font-bold text-primary">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
              ShipSwift
            </Link>
            <CardTitle className="font-heading text-2xl">{isRegister ? "Create Account" : "Welcome Back"}</CardTitle>
            <CardDescription>{isRegister ? "Start shipping in minutes" : "Log in to manage your shipments"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Rahul Sharma" className="mt-1" value={form.name} onChange={update("name")} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+91 98765 43210" className="mt-1" value={form.phone} onChange={update("phone")} />
                  </div>
                </motion.div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" className="mt-1" value={form.email} onChange={update("email")} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={update("password")} required minLength={6} className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isRegister ? "Create Account" : "Log In"}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => setIsRegister(!isRegister)} className="font-semibold text-primary hover:underline">
                {isRegister ? "Log In" : "Sign Up"}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
