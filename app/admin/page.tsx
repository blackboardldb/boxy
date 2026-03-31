"use client";

import Logo from "@/components/Logo";
import { AdminDashboard } from "../../components/admincomponents/admin-dashboard";

export default function AdminPage() {
  return (
    <div className="p-0 md:p-8">
      <div className="my-8">
         <Logo size={140} />
        <h1 className="text-3xl font-bold hidden lg:block">BlackSheep</h1>
      </div>
      <AdminDashboard />
    </div>
  );
}
