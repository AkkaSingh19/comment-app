"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { useRouter } from "next/navigation"; 

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email(),
    password: z.string().min(1, { message: "Password is required" }),
    confirmpassword: z.string().min(1, { message: "Confirm your password" }),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords don't match",
    path: ["confirmpassword"],
  });

export const SignUpView = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmpassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await axios.post("http://localhost:8288/auth/signup", {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      console.log("Registration Success:", res.data);
      router.push("/sign-in");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Registration Error:",
          error.response?.data?.message || error.message
        );
        setError(error.response?.data?.message || "Something went wrong");
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <div className="flex justify-center items-center min-h-screen px-4">
    <Card className="dark bg-background/100 w-full max-w-2xl p-8 overflow-hidden">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8 w-full">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold">Let&apos;s get started</h1>
            <p className="text-muted-foreground text-2xl text-balance">
              Create your account
            </p>
          </div>

          {["name", "email", "password", "confirmpassword"].map((fieldName, idx) => (
            <div className="grid gap-3 text-xl" key={idx}>
              <FormField
                    control={form.control}
                    name={fieldName as keyof z.infer<typeof formSchema>}
                    render={({ field }) => (
                    <FormItem>
                    <FormLabel className="capitalize">
                      {field.name === "confirmpassword"
                        ? "Confirm Password"
                        : field.name}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={
                          field.name.includes("password") ? "password" : "text"
                        }
                        placeholder={
                          field.name === "email"
                            ? "you@example.com"
                            : field.name.includes("password")
                            ? "********"
                            : `Enter your ${field.name}`
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          {!!error && (
            <Alert className="bg-destructive/10 border-none">
              <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          <Button disabled={isSubmitting} type="submit" className="w-full">
            {isSubmitting ? "Signing up..." : "Sign up"}
          </Button>
        </div>

        <div className="text-center text-m mt-4">
          Already have an account?{" "}
          <Link href="/sign-in" className="underline underline-offset-4">
            Sign-in
          </Link>
        </div>
      </form>
    </Form>
  </Card>
</div>
  )
}

