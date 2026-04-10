import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isRegister ? "Account created!" : "Logged in successfully!");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-4 flex items-center gap-2 font-heading text-2xl font-bold text-primary">
            <Truck className="h-7 w-7" /> ShipSwift
          </Link>
          <CardTitle className="font-heading text-2xl">{isRegister ? "Create Account" : "Welcome Back"}</CardTitle>
          <CardDescription>{isRegister ? "Start shipping in minutes" : "Log in to manage your shipments"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div><Label htmlFor="name">Full Name</Label><Input id="name" placeholder="Rahul Sharma" className="mt-1" /></div>
                <div><Label htmlFor="phone">Phone</Label><Input id="phone" placeholder="+91 98765 43210" className="mt-1" /></div>
              </>
            )}
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" className="mt-1" /></div>
            <div><Label htmlFor="password">Password</Label><Input id="password" type="password" placeholder="••••••••" className="mt-1" /></div>
            <Button type="submit" className="w-full">{isRegister ? "Create Account" : "Log In"}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => setIsRegister(!isRegister)} className="font-medium text-primary hover:underline">
              {isRegister ? "Log In" : "Sign Up"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
