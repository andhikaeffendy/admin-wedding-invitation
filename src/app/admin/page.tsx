"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminHome() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/dashboard"); }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
      <div className="w-10 h-10 border-2 border-[#C9A86A] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
