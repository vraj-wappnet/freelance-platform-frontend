// export default function AuthLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return <div className="min-h-screen bg-background">{children}</div>;
// }

'use client';

import { LandingNavbar } from "@/components/landing/navbar";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      {children}
    </div>
  );
}