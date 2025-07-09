"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OctagonAlertIcon } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import axios from "axios";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export const SignInView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:8288/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        router.push("/"); 
      }
    } catch (err) {
      console.error("Token invalid, removing from localStorage.");
      localStorage.removeItem("token");
    }
  };

  checkAuth();
}, [router]);

 const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setError(null);
  setIsSubmitting(true);

  try {
    const res = await axios.post("http://localhost:8288/auth/signin", values);
    const token = res.data?.token?.accessToken || res.data?.accessToken || res.data?.token;
    
    if (token) {
      localStorage.setItem("token", token);
      router.push("/");
    } else {
      setError("Unexpected response from server");
    }
  } catch (error: any) {
    setError(error.response?.data?.message || "Invalid credentials"); 
  } finally {
    setIsSubmitting(false);
  }
};


  return (
  <div className="flex justify-center items-center min-h-screen px-4">
    <div className="w-full max-w-md">
      <Card className="dark bg-background/100 overflow-hidden p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-xl text-balance">
                  Login to your account
                </p>
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="m@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {!!error && (
                <Alert className="bg-destructive/10 border-none">
                  <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}

              <Button disabled={isSubmitting} type="submit" className="w-full">
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="underline underline-offset-4">
                  Sign-up
                </Link>
               </div>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  </div>
);
};
