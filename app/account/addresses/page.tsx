'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { databases, COLLECTIONS, DATABASE_ID } from '@/lib/appwrite';
import { Address } from '@/types/orders';
import { formatCurrency } from '@/lib/copy';
import { Plus, MapPin, Edit, Trash2, Star } from 'lucide-react';
import AddressForm from './address-form';

export default function AddressesPage() {
  const { authState } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadAddresses();
    }
  }, [authState.isAuthenticated, authState.user]);

  async function loadAddresses() {
    if (!authState.user) return;

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ADDRESSES,
        [`userId=${authState.user.$id}`]
      );

      setAddresses(response.documents as Address[]);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.ADDRESSES,
        addressId
      );

      await loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!authState.user) return;

    try {
      // Remove default from all addresses
      const allAddresses = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ADDRESSES,
        [`userId=${authState.user.$id}`]
      );

      for (const addr of allAddresses.documents) {
        if (addr.isDefault) {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.ADDRESSES,
            addr.$id,
            { isDefault: false }
          );
        }
      }

      // Set new default
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ADDRESSES,
        addressId,
        { isDefault: true }
      );

      await loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAddress(null);
    loadAddresses(); // Refresh the list
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="text-center">
        <p>Please sign in to manage your addresses.</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Addresses</h1>
          <p className="text-base-content/70">
            Manage your delivery addresses for easy ordering.
          </p>
        </div>
        <button
          onClick={handleAddAddress}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </button>
      </div>

      {showForm && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <AddressForm
              address={editingAddress}
              onClose={handleFormClose}
              userId={authState.user.$id}
            />
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No addresses yet</h2>
          <p className="text-base-content/70 mb-6">
            Add your first address to make ordering easier.
          </p>
          <button
            onClick={handleAddAddress}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.$id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">{address.label}</h3>
                    {address.isDefault && (
                      <div className="badge badge-primary">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-sm text-base-content/70 mb-4">
                  <div>{address.line1}</div>
                  {address.line2 && <div>{address.line2}</div>}
                  <div>{address.city}</div>
                  {address.county && <div>{address.county}</div>}
                  <div>{address.postcode}</div>
                  <div>{address.country}</div>
                </div>

                <div className="card-actions justify-end">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.$id!)}
                      className="btn btn-sm btn-outline"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="btn btn-sm btn-outline"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.$id!)}
                    className="btn btn-sm btn-error"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UK Postcode Helper */}
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">UK Postcode Help</h3>
          <p className="text-sm">
            UK postcodes follow format like "LS1 3AB" or "M1 1AA". 
            They help us find your address quickly for delivery.
          </p>
        </div>
      </div>
    </div>
  );
}

