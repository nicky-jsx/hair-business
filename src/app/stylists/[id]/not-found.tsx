import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
      <h1 className="font-display text-2xl font-semibold text-gray-900">
        Stylist not found
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        This profile doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/stylists"
        className="mt-6 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        Back to discover
      </Link>
    </div>
  );
}
