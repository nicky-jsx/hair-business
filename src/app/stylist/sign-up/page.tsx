import { SignUpForm } from "@/components/stylist/signup/SignUpForm";

export default function StylistSignUpPage() {
  return (
    <div className="px-5 pb-8 pt-6">
      <p className="mb-2 text-sm font-medium text-brand-600">For stylists</p>
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        Join Strand
      </h1>
      <p className="mt-2 mb-6 text-sm text-gray-500 leading-relaxed">
        Create your account and set up your profile to reach clients across
        London.
      </p>
      <SignUpForm />
    </div>
  );
}
