import { Metadata } from "next";
import { AdminDashboard } from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | Olgish Cakes Admin",
  description: "Central admin dashboard for managing all aspects of Olgish Cakes",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}