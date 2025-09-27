'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { databases, COLLECTIONS, DATABASE_ID } from '@/lib/appwrite';
import { Order, OrderWithItems } from '@/types/orders';
import { formatCurrency, formatDate } from '@/lib/copy';
import { ShoppingBag, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const { authState } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadOrders();
    }
  }, [authState.isAuthenticated, authState.user]);

  async function loadOrders() {
    if (!authState.user) return;

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        [`userId=${authState.user.$id}`],
        50, // Limit to 50 orders
        undefined,
        undefined,
        undefined,
        undefined,
        ['createdAt', 'desc']
      );

      const ordersWithItems: OrderWithItems[] = await Promise.all(
        response.documents.map(async (order) => {
          const itemsResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ORDER_ITEMS,
            [`orderId=${order.$id}`]
          );
          
          return {
            ...order,
            items: itemsResponse.documents,
          } as OrderWithItems;
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-error" />;
      case 'FULFILLED':
        return <Package className="h-4 w-4 text-info" />;
      default:
        return <Clock className="h-4 w-4 text-base-content/50" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'badge-success';
      case 'PENDING':
        return 'badge-warning';
      case 'CANCELLED':
        return 'badge-error';
      case 'FULFILLED':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Paid';
      case 'PENDING':
        return 'Pending Payment';
      case 'CANCELLED':
        return 'Cancelled';
      case 'FULFILLED':
        return 'Completed';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return status;
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="text-center">
        <p>Please sign in to view your orders.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Orders</h1>
        <p className="text-base-content/70">
          View all your orders and their current status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-base-content/70 mb-6">
            When you place your first order, it will appear here.
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.$id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-bold">Order #{order.$id?.slice(-8)}</h3>
                      <p className="text-sm text-base-content/70">
                        {order.createdAt ? formatDate(order.createdAt) : 'Date unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`badge ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                    <div className="text-lg font-bold mt-1">
                      {formatCurrency(order.totalGBP)}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{item.name}</span>
                        <span>
                          {item.quantity} × {formatCurrency(item.unitPriceGBP)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-base-content/70">Email:</span>
                    <br />
                    {order.email}
                  </div>
                  <div>
                    <span className="text-base-content/70">Delivery Address:</span>
                    <br />
                    <div className="text-xs">
                      {order.shippingName}
                      <br />
                      {order.shippingAddress.line1}
                      {order.shippingAddress.line2 && <><br />{order.shippingAddress.line2}</>}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.postcode}
                    </div>
                  </div>
                </div>

                <div className="card-actions justify-end mt-4">
                  <Link 
                    href={`/account/orders/${order.$id}`}
                    className="btn btn-outline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Status Help */}
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">Order Status Help</h3>
          <div className="text-sm space-y-1">
            <div><strong>Pending:</strong> Waiting for payment</div>
            <div><strong>Paid:</strong> Payment received, preparing your order</div>
            <div><strong>Completed:</strong> Order delivered successfully</div>
            <div><strong>Cancelled:</strong> Order was cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
}


