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
      <OrderManagementDashboard />
    </AdminAuthGuard>
  );
}
