'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { databases, COLLECTIONS, DATABASE_ID } from '@/lib/appwrite';
import { Address } from '@/types/orders';
import { X } from 'lucide-react';

const addressSchema = z.object({
  label: z.string().min(2, 'Label must be at least 2 characters'),
  line1: z.string().min(2, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  county: z.string().optional(),
  postcode: z.string().regex(
    /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
    'Please enter a valid UK postcode'
  ),
  country: z.string().default('GB'),
  isDefault: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  address?: Address | null;
  onClose: () => void;
  userId: string;
}

export default function AddressForm({ address, onClose, userId }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label || '',
      line1: address?.line1 || '',
      line2: address?.line2 || '',
      city: address?.city || '',
      county: address?.county || '',
      postcode: address?.postcode || '',
      country: address?.country || 'GB',
      isDefault: address?.isDefault || false,
    },
  });

  const isDefault = watch('isDefault');

  const onSubmit = async (data: AddressFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (address) {
        // Update existing address
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.ADDRESSES,
          address.$id!,
          data
        );
      } else {
        // Create new address
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.ADDRESSES,
          'unique()',
          {
            userId,
            ...data,
          }
        );
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving address:', error);
      setError(error.message || 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          {address ? 'Edit Address' : 'Add New Address'}
        </h2>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="form-control">
          <label className="label" htmlFor="label">
            <span className="label-text">Address Label</span>
          </label>
          <input
            {...register('label')}
            type="text"
            id="label"
            className="input input-bordered"
            placeholder="e.g., Home, Work, Mum's House"
            disabled={isLoading}
          />
          {errors.label && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.label.message}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label" htmlFor="line1">
            <span className="label-text">Address Line 1</span>
          </label>
          <input
            {...register('line1')}
            type="text"
            id="line1"
            className="input input-bordered"
            placeholder="House number and street name"
            disabled={isLoading}
          />
          {errors.line1 && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.line1.message}</span>
            </label>
          )}
        </div>

        <div className="form-control">
          <label className="label" htmlFor="line2">
            <span className="label-text">Address Line 2 (Optional)</span>
          </label>
          <input
            {...register('line2')}
            type="text"
            id="line2"
            className="input input-bordered"
            placeholder="Apartment, suite, unit, etc."
            disabled={isLoading}
          />
          {errors.line2 && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.line2.message}</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label" htmlFor="city">
              <span className="label-text">City</span>
            </label>
            <input
              {...register('city')}
              type="text"
              id="city"
              className="input input-bordered"
              placeholder="City"
              disabled={isLoading}
            />
            {errors.city && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.city.message}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label" htmlFor="county">
              <span className="label-text">County (Optional)</span>
            </label>
            <input
              {...register('county')}
              type="text"
              id="county"
              className="input input-bordered"
              placeholder="County"
              disabled={isLoading}
            />
            {errors.county && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.county.message}</span>
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label" htmlFor="postcode">
              <span className="label-text">Postcode</span>
            </label>
            <input
              {...register('postcode')}
              type="text"
              id="postcode"
              className="input input-bordered"
              placeholder="e.g., LS1 3AB"
              disabled={isLoading}
            />
            {errors.postcode && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.postcode.message}</span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label" htmlFor="country">
              <span className="label-text">Country</span>
            </label>
            <select
              {...register('country')}
              id="country"
              className="select select-bordered"
              disabled={isLoading}
            >
              <option value="GB">United Kingdom</option>
            </select>
          </div>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Set as default address</span>
            <input
              {...register('isDefault')}
              type="checkbox"
              className="toggle toggle-primary"
              disabled={isLoading}
            />
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              address ? 'Update Address' : 'Add Address'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

