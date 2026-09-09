import { DirectoryExplorer } from "@/components/stylist/DirectoryExplorer";

export const revalidate = 60; // Revalidate every 60 seconds

export default function HomePage() {
  return <DirectoryExplorer />;
}

