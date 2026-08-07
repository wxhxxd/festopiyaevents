import { Suspense } from "react";
import ProfileClient from "./ProfileClient";

export default function PublicProfilePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#0c0c0e] text-white">Loading...</div>}>
      <ProfileClient />
    </Suspense>
  );
}
