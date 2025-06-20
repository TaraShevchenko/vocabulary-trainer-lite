import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <SignUp fallbackRedirectUrl="/" />
    </div>
  );
}
