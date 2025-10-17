import SignInComponent from "@/components/sign-in";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SignIn() {

  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (session) {
    redirect("/dashboard")
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="max-w-md w-full space-y-8">
        <SignInComponent />
      </div>
    </div>
  );
}
