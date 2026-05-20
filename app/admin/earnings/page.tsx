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
      <EarningsDashboard />
    </AdminAuthGuard>
  );
}
