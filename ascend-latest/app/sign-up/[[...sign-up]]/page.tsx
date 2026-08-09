import {
  SignUp,
} from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05070B] px-6">
      <SignUp
        forceRedirectUrl="/auth/continue"
        signInForceRedirectUrl="/auth/continue"
        signInUrl="/sign-in"
      />
    </main>
  );
}
