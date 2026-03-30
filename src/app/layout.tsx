import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BracketIQ — AI March Madness Predictor",
  description: "AI-powered NCAA March Madness bracket predictions and matchup analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
