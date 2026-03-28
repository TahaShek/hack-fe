"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ArrowRight } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

export default function SellerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/seller/dashboard"), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
            <Store size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Start Selling</h1>
          <p className="text-zinc-500 mt-1">Create your seller account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Store Name" id="storeName" placeholder="My Awesome Store" />
            <Input label="Owner Name" id="ownerName" placeholder="John Doe" />
          </div>
          <Input label="Email" id="email" type="email" placeholder="seller@example.com" />
          <Input label="Phone" id="phone" placeholder="+1 555-0123" />
          <Textarea label="Store Description" id="description" placeholder="Tell buyers about your store..." rows={3} />
          <Input label="Business Address" id="address" placeholder="123 Business St, City" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Password" id="password" type="password" placeholder="Min 8 characters" />
            <Input label="Confirm Password" id="confirmPassword" type="password" placeholder="Repeat password" />
          </div>
          <Button type="submit" size="lg" className="w-full gap-2" isLoading={loading}>
            Create Account <ArrowRight size={16} />
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link href="/seller/login" className="text-violet-400 hover:text-violet-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
