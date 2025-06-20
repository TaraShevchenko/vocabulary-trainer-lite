import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ruRU } from "@clerk/localizations";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TRPCReactProvider } from "@/shared/api/client";
import "@/shared/styles/globals.css";
import { Button } from "@/shared/ui/button";
// import { NavigationMenu } from "@/shared/ui/navigation-menu";

export const metadata: Metadata = {
  title: "Планировщик блюд",
  description: "Планирование, учет, управление блюдами и меню в целом",
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
      localization={ruRU}
      afterSignOutUrl="/login"
      signInUrl="/login"
      signUpUrl="/register"
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" className={`dark ${geist.variable}`}>
        <body className="flex min-h-screen flex-col">
          <header className="flex h-16 items-center justify-end gap-2 px-4 pb-2 pt-4">
            <SignedOut>
              <Button variant={"outline"} asChild>
                <SignInButton>Войти</SignInButton>
              </Button>
              <Button asChild>
                <SignUpButton>Регистрация</SignUpButton>
              </Button>
            </SignedOut>
            <SignedIn>
              <div className="flex w-full items-center justify-between">
                {/* <NavigationMenu
                  items={[
                    {
                      title: "Дашборд",
                      href: "/",
                    },
                  ]}
                /> */}
                <UserButton />
              </div>
            </SignedIn>
          </header>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
