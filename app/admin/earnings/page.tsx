import { Metadata } from "next";
import { EarningsDashboard } from "./EarningsDashboard";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";

export const metadata: Metadata = {
  title: "Earnings Dashboard | Olgish Cakes Admin",
  description: "View detailed earnings reports, monthly statistics, and financial insights",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminEarningsPage() {
  return (
    <AdminAuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Earnings Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Track your monthly earnings, order statistics, and financial performance
          </p>
        </div>
        
        <EarningsDashboard />
      </div>
    </AdminAuthGuard>
  );
}
