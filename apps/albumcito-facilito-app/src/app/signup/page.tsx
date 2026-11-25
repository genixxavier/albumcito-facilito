import { signupAction } from "@/app/actions";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return <AuthForm mode="signup" action={signupAction} />;
}
