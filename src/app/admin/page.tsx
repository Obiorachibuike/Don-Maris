
import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";
import UserModel from "@/models/User";
import ProductModel from "@/models/Product";
import type { Order, User, Product } from "@/lib/types";
import { AdminDashboardClient, type DashboardData } from "@/components/admin-dashboard-client";

export default async function AdminDashboard() {
  
  try {
    await connectDB();
    const orders: Order[] = JSON.parse(JSON.stringify(await OrderModel.find({}).sort({ date: -1 }).lean()));
    const users: User[] = JSON.parse(JSON.stringify(await UserModel.find({ role: 'customer' }).lean()));
    const products: Product[] = JSON.parse(JSON.stringify(await ProductModel.find({}).lean()));

    const data: DashboardData = {
      orders,
      users,
      products,
    };

    return <AdminDashboardClient data={data} />;

  } catch (error) {
    console.error("Failed to load admin dashboard data:", error);
    return (
        <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-destructive">Error Loading Dashboard</h2>
            <p className="text-muted-foreground">Could not connect to the database. Please try again later.</p>
        </div>
    )
  }
}
