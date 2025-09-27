'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCheckoutSession } from '@/lib/stripe';
import { formatCurrency } from '@/lib/copy';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadSessionDetails();
    } else {
      setError('No session ID provided');
      setIsLoading(false);
    }
  }, [sessionId]);

  async function loadSessionDetails() {
    try {
      const response = await fetch(`/api/stripe/session/${sessionId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSession(data.session);
      } else {
        setError(data.error || 'Failed to load order details');
      }
    } catch (err) {
      console.error('Error loading session:', err);
      setError('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <div className="text-error text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
              <p className="text-base-content/70 mb-6">
                {error || 'We could not find your order details. Please contact us if you have any questions.'}
              </p>
              <div className="space-y-2">
                <Link href="/contact" className="btn btn-primary w-full">
                  Contact Support
                </Link>
                <Link href="/" className="btn btn-outline w-full">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-success text-6xl mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Thank you so much!
          </h1>
          <p className="text-base-content/70">
            Your order is on the way, like warm hug from kitchen.
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title mb-4">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-base-content/70">Order ID:</span>
                <span className="font-mono text-sm">
                  {session.id.slice(-12)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-base-content/70">Email:</span>
                <span>{session.customer_details?.email || session.customer_email}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-base-content/70">Total:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(session.amount_total)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-base-content/70">Payment Status:</span>
                <span className="badge badge-success">Paid</span>
              </div>
            </div>

            {session.shipping_details && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Delivery Address</h3>
                <div className="text-sm text-base-content/70">
                  <div>{session.shipping_details.name}</div>
                  <div>{session.shipping_details.address?.line1}</div>
                  {session.shipping_details.address?.line2 && (
                    <div>{session.shipping_details.address.line2}</div>
                  )}
                  <div>{session.shipping_details.address?.city}</div>
                  {session.shipping_details.address?.state && (
                    <div>{session.shipping_details.address.state}</div>
                  )}
                  <div>{session.shipping_details.address?.postal_code}</div>
                  <div>{session.shipping_details.address?.country}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Timeline */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title mb-4">What happens next?</h2>
            
            <div className="steps steps-vertical lg:steps-horizontal">
              <div className="step step-primary">
                <div className="step-content">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-semibold">Order Confirmed</span>
                  </div>
                  <p className="text-sm text-base-content/70">
                    We received your payment and order details
                  </p>
                </div>
              </div>
              
              <div className="step step-primary">
                <div className="step-content">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4" />
                    <span className="font-semibold">Preparing</span>
                  </div>
                  <p className="text-sm text-base-content/70">
                    We are making your delicious treats with love
                  </p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-content">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="h-4 w-4" />
                    <span className="font-semibold">On the Way</span>
                  </div>
                  <p className="text-sm text-base-content/70">
                    Your order is being delivered to you
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title justify-center mb-4">What would you like to do?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/account/orders" className="btn btn-outline">
                View My Orders
              </Link>
              <Link href="/products" className="btn btn-outline">
                Browse More Products
              </Link>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-base-content/70 mb-4">
                Questions about your order? We are here to help.
              </p>
              <Link href="/contact" className="btn btn-primary">
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="btn btn-ghost">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}


