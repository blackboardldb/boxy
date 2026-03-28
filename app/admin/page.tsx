"use client";

import { AdminDashboard } from "../../components/admincomponents/admin-dashboard";

export default function AdminPage() {
  return (
    <div className="p-0 md:p-8">
      <div className="mb-2">
        <h1 className="text-3xl font-bold hidden lg:block">BlackSheep</h1>
      </div>
      <AdminDashboard />
    </div>
  );
}
