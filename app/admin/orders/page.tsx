import { Metadata } from "next";
import { OrderManagementDashboard } from "./OrderManagementDashboard";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";

export const metadata: Metadata = {
  title: "Order Management | Olgish Cakes Admin",
  description: "Manage all orders, update statuses, and track deliveries",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminOrdersPage() {
  return (
    <AdminAuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-2 text-gray-600">
            Track and manage all customer orders from one place
          </p>
        </div>

        <OrderManagementDashboard />
      </div>
    </AdminAuthGuard>
  );
}
