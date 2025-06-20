import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <SignIn fallbackRedirectUrl="/" />
    </div>
  );
}
