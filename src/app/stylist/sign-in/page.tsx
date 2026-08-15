import { SignInForm } from "@/components/stylist/signup/SignInForm";

export default function StylistSignInPage() {
  return (
    <div className="px-5 pb-8 pt-6">
      <p className="mb-2 text-sm font-medium text-brand-600">For stylists</p>
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        Welcome back
      </h1>
      <p className="mt-2 mb-6 text-sm text-gray-500 leading-relaxed">
        Sign in to manage your profile and connect with clients.
      </p>
      <SignInForm />
    </div>
  );
}
