'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/copy';
import { Product } from '@/types/orders';
import { ShoppingCart, Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface GiftHamperProductProps {
  product: Product;
}

export default function GiftHamperProduct({ product }: GiftHamperProductProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();

  const handleBuyNow = async () => {
    if (!authState.isAuthenticated) {
      // Redirect to sign in
      window.location.href = '/auth/sign-in?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/hamper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.$id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(({ loadStripe }) => 
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      );

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure className="relative h-64 md:h-80">
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-base-200">
            <span className="text-base-content/50">No image available</span>
          </div>
        )}
      </figure>
      
      <div className="card-body">
        <div className="flex items-start justify-between mb-2">
          <h2 className="card-title text-lg">{product.name}</h2>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm">
              <Heart className="h-4 w-4" />
            </button>
            <button className="btn btn-ghost btn-sm">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-2xl font-bold text-primary mb-2">
            {formatCurrency(product.priceGBP)}
          </div>
          <p className="text-base-content/70 text-sm leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Allergen Information */}
        <div className="alert alert-info mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-sm">
            Please let us know about any allergies when ordering. We can make adjustments for you.
          </span>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="card-actions">
          <button
            onClick={handleBuyNow}
            className="btn btn-primary flex-1"
            disabled={!product.isActive || isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Buy now
              </>
            )}
          </button>
        </div>

        {!product.isActive && (
          <div className="alert alert-warning mt-4">
            <span>Sorry, not available right now. Check back soon?</span>
          </div>
        )}

        {/* Additional Information */}
        <div className="divider"></div>
        
        <div className="space-y-2 text-sm text-base-content/70">
          <div className="flex justify-between">
            <span>Delivery:</span>
            <span>UK only</span>
          </div>
          <div className="flex justify-between">
            <span>Preparation time:</span>
            <span>2-3 days</span>
          </div>
          <div className="flex justify-between">
            <span>Storage:</span>
            <span>Keep refrigerated</span>
          </div>
        </div>

        {/* Related Products Link */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-base-content/70 mb-2">
            Looking for more treats?
          </p>
          <Link href="/products" className="btn btn-outline btn-sm">
            Browse all products
          </Link>
        </div>
      </div>
    </div>
  );
}

