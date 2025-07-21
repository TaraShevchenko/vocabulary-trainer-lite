import { Suspense } from "react";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "react-hot-toast";
import { TRPCReactProvider } from "@/shared/api/client";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import "./globals.css";

// import { NavigationMenu } from "@/shared/ui/navigation-menu";

export const metadata: Metadata = {
  title: "Vocabulary Trainer Lite",
  description: "Learn and manage English vocabulary effectively",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/login"
      signInUrl="/login"
      signUpUrl="/register"
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" className={`dark ${geist.variable}`}>
        <body className="flex min-h-screen flex-col">
          <header className="container mx-auto px-4 py-8 flex justify-end gap-2">
            <SignedOut>
              <Button variant={"outline"} asChild>
                <SignInButton>Sign In</SignInButton>
              </Button>
              <Button asChild>
                <SignUpButton>Sign Up</SignUpButton>
              </Button>
            </SignedOut>
            <SignedIn>
              {/* <NavigationMenu
                  items={[
                    {
                      title: "Дашборд",
                      href: "/",
                    },
                  ]}
                /> */}

              <UserButton
                fallback={<Skeleton className="h-7 w-7 rounded-full" />}
              />
            </SignedIn>
          </header>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 2000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
