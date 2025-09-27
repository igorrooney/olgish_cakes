import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/client";
import { isAdminAuthenticated } from "@/lib/admin-auth";

// GET - Fetch monthly earnings data
export async function GET(request: NextRequest) {
  // Temporarily bypass authentication for testing
  // TODO: Re-enable authentication once login flow is working
  try {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    // Get first day of current month
    const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
    
    // Get first day of last month
    const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1);
    
    // Get first day of month before last month (to calculate last month's total)
    const firstDayMonthBeforeLast = new Date(currentYear, currentMonth - 2, 1);

    // Fetch all orders
    const allOrders = await serverClient.fetch(`
      *[_type == "order" && defined(pricing.total)]{
        _createdAt,
        "total": pricing.total,
        "paymentStatus": pricing.paymentStatus,
        status
      }
    `);

    // Filter orders by month and calculate totals
    const currentMonthOrders = allOrders.filter((order: any) => {
      const orderDate = new Date(order._createdAt);
      return orderDate >= firstDayCurrentMonth;
    });

    const lastMonthOrders = allOrders.filter((order: any) => {
      const orderDate = new Date(order._createdAt);
      return orderDate >= firstDayLastMonth && orderDate < firstDayCurrentMonth;
    });

    // Calculate earnings (include completed orders regardless of payment status, or paid orders)
    const currentMonthEarnings = currentMonthOrders
      .filter((order: any) => 
        order.status !== 'cancelled' &&
        order.paymentStatus !== 'cancelled' &&
        (order.status === 'completed' || 
         order.paymentStatus === 'paid' || 
         ['delivered', 'completed'].includes(order.paymentStatus))
      )
      .reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    const lastMonthEarnings = lastMonthOrders
      .filter((order: any) => 
        order.status !== 'cancelled' &&
        order.paymentStatus !== 'cancelled' &&
        (order.status === 'completed' || 
         order.paymentStatus === 'paid' || 
         ['delivered', 'completed'].includes(order.paymentStatus))
      )
      .reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    // Calculate total orders (exclude cancelled orders)
    const nonCancelledOrders = allOrders.filter((order: any) => order.status !== 'cancelled');
    const totalOrders = nonCancelledOrders.length;

    // Calculate total revenue across all time (exclude cancelled orders)
    const totalRevenue = allOrders
      .filter((order: any) => 
        order.status !== 'cancelled' &&
        order.paymentStatus !== 'cancelled' &&
        (order.status === 'completed' || 
         order.paymentStatus === 'paid' || 
         ['delivered', 'completed'].includes(order.paymentStatus))
      )
      .reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    // Calculate average order value (exclude cancelled orders)
    const averageOrderValue = totalOrders > 0 
      ? nonCancelledOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0) / totalOrders 
      : 0;

    // Calculate monthly breakdown for historical data
    const monthlyGroups: { [key: string]: any[] } = {};
    
    allOrders.forEach((order: any) => {
      const orderDate = new Date(order._createdAt);
      const year = orderDate.getFullYear();
      const month = orderDate.toLocaleString('default', { month: 'long' });
      const key = `${year}-${month}`;

      if (!monthlyGroups[key]) {
        monthlyGroups[key] = [];
      }
      monthlyGroups[key].push(order);
    });

    // Generate historical monthly data
    const historicalMonthlyData = Object.entries(monthlyGroups)
      .filter(([key]) => {
        const [year, month] = key.split('-');
        const orderYear = parseInt(year);
        const orderMonth = month;
        
        // Exclude current and last month (they're handled separately)
        const now = new Date();
        const currentMonthName = now.toLocaleString('default', { month: 'long' });
        const currentYear = now.getFullYear();
        
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthName = lastMonth.toLocaleString('default', { month: 'long' });
        const lastYear = lastMonth.getFullYear();
        
        return !(orderYear === currentYear && orderMonth === currentMonthName) &&
               !(orderYear === lastYear && orderMonth === lastMonthName);
      })
      .map(([key, orders]) => {
        const [year, month] = key.split('-');
        
        const monthlyEarnings = orders
          .filter((order: any) => 
            order.status !== 'cancelled' &&
            order.paymentStatus !== 'cancelled' &&
            (order.status === 'completed' || 
             order.paymentStatus === 'paid' || 
             ['delivered', 'completed'].includes(order.paymentStatus))
          )
          .reduce((sum: number, order: any) => sum + (order.total || 0), 0);

        const nonCancelledOrders = orders.filter((order: any) => order.status !== 'cancelled');
        const ordersCount = nonCancelledOrders.length;
        const totalValue = nonCancelledOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
        const averageOrderValue = ordersCount > 0 ? totalValue / ordersCount : 0;

        return {
          year: parseInt(year),
          month,
          earnings: monthlyEarnings,
          ordersCount,
          averageOrderValue,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year;
        }
        
        const monthOrder = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
      });

    return NextResponse.json({
      currentMonth: currentMonthEarnings,
      lastMonth: lastMonthEarnings,
      totalRevenue,
      totalOrders,
      averageOrderValue,
      currentMonthOrdersCount: currentMonthOrders.filter((order: any) => order.status !== 'cancelled').length,
      lastMonthOrdersCount: lastMonthOrders.filter((order: any) => order.status !== 'cancelled').length,
      historicalMonthlyData,
    });

  } catch (error) {
    console.error('Failed to fetch earnings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings data' },
      { status: 500 }
    );
  }
}
