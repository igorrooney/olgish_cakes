'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { databases, COLLECTIONS, DATABASE_ID } from '@/lib/appwrite';
import { Order, OrderWithItems, Address } from '@/types/orders';
import { formatCurrency, formatDate } from '@/lib/copy';
import { ShoppingBag, MapPin, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AccountOverview() {
  const { authState } = useAuth();
  const [recentOrders, setRecentOrders] = useState<OrderWithItems[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadAccountData();
    }
  }, [authState.isAuthenticated, authState.user]);

  async function loadAccountData() {
    if (!authState.user) return;

    try {
      // Load recent orders
      const ordersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        [`userId=${authState.user.$id}`],
        5, // Limit to 5 recent orders
        undefined,
        undefined,
        undefined,
        undefined,
        ['createdAt', 'desc']
      );

      const ordersWithItems: OrderWithItems[] = await Promise.all(
        ordersResponse.documents.map(async (order) => {
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

      setRecentOrders(ordersWithItems);

      // Load default address
      const addressesResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ADDRESSES,
        [`userId=${authState.user.$id}`, `isDefault=true`]
      );

      if (addressesResponse.documents.length > 0) {
        setDefaultAddress(addressesResponse.documents[0] as Address);
      }
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="text-center">
        <p>Please sign in to view your account.</p>
        <Link href="/auth/sign-in" className="btn btn-primary mt-4">
          Sign In
        </Link>
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-warning" />;
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
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Hello, {authState.user.name}! 
        </h1>
        <p className="text-base-content/70">
          Welcome back to your account. Here's what's happening with your orders.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-primary">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div className="stat-title">Total Orders</div>
          <div className="stat-value text-primary">{recentOrders.length}</div>
        </div>
        
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-secondary">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div className="stat-title">Completed</div>
          <div className="stat-value text-secondary">
            {recentOrders.filter(order => order.status === 'PAID').length}
          </div>
        </div>
        
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-figure text-accent">
            <MapPin className="h-8 w-8" />
          </div>
          <div className="stat-title">Default Address</div>
          <div className="stat-value text-accent">
            {defaultAddress ? 'Set' : 'Not Set'}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Link href="/account/orders" className="btn btn-sm btn-outline">
            View All
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
            <p className="text-base-content/70 mb-4">No orders yet</p>
            <Link href="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.$id} className="card bg-base-200">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="font-medium">Order #{order.$id?.slice(-8)}</span>
                    </div>
                    <div className={`badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-base-content/70">Date:</span>
                      <br />
                      {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                    </div>
                    <div>
                      <span className="text-base-content/70">Total:</span>
                      <br />
                      <span className="font-medium">{formatCurrency(order.totalGBP)}</span>
                    </div>
                    <div>
                      <span className="text-base-content/70">Items:</span>
                      <br />
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link 
                      href={`/account/orders/${order.$id}`}
                      className="btn btn-sm btn-outline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Default Address */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Default Address</h2>
          <Link href="/account/addresses" className="btn btn-sm btn-outline">
            Manage
          </Link>
        </div>
        
        {defaultAddress ? (
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <div className="font-medium">{defaultAddress.label}</div>
                  <div className="text-sm text-base-content/70">
                    {defaultAddress.line1}
                    {defaultAddress.line2 && <><br />{defaultAddress.line2}</>}
                    <br />
                    {defaultAddress.city}
                    {defaultAddress.county && <>, {defaultAddress.county}</>}
                    <br />
                    {defaultAddress.postcode}
                    <br />
                    {defaultAddress.country}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
            <p className="text-base-content/70 mb-4">No default address set</p>
            <Link href="/account/addresses" className="btn btn-primary">
              Add Address
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


