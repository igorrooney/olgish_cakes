"use client";

import { useState } from "react";

export function MobileForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    occasion: "",
    date: "",
    requirements: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <section className="bg-base-100 px-6 py-8">
      <div className="flex flex-col gap-6">
        <h2 className="font-display text-2xl text-primary-700 text-center uppercase tracking-wider leading-10">
          Custom cake enquiry form
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-sans text-sm text-base-content">
                Full Name:
              </span>
            </label>
            <input
              type="text"
              placeholder="Enter name"
              className="input input-bordered bg-white rounded-box border-base-content border-opacity-20"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-sans text-sm text-base-content">
                Email address:
              </span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="input input-bordered bg-white rounded-box border-base-content border-opacity-20"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-sans text-sm text-base-content">
                Phone number:
              </span>
            </label>
            <input
              type="tel"
              placeholder="+44 (0) 7XXX XXX XXX"
              className="input input-bordered bg-white rounded-box border-base-content border-opacity-20"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-sans text-sm text-base-content">
                Address:
              </span>
            </label>
            <input
              type="text"
              placeholder="Enter address line 1"
              className="input input-bordered bg-white rounded-box border-base-content border-opacity-20"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-sans text-sm text-base-content">
                City:
              </span>
            </label>
            <input
              type="text"
              placeholder="Enter city"
              className="input input-bordered bg-white rounded-box border-base-content border-opacity-20"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-sans text-sm text-base-content">
                Postcode:
              </span>
            </label>
            <input
              type="text"
              placeholder="Enter postcode"
              className="input input-bordered bg-white rounded-box border-base-content border-opacity-20"
              value={formData.postcode}
              onChange={(e) =>
                setFormData({ ...formData, postcode: e.target.value })
              }
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-sans text-sm text-base-content">
                What's the occasion?
              </span>
              <span className="label-text-alt text-xs text-base-content">
                (Optional)
              </span>
            </label>
            <select
              className="select select-bordered bg-white rounded-box border-base-content border-opacity-20"
              value={formData.occasion}
              onChange={(e) =>
                setFormData({ ...formData, occasion: e.target.value })
              }
            >
              <option>Select from list</option>
              <option>Birthday</option>
              <option>Wedding</option>
              <option>Anniversary</option>
              <option>Christmas</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-sans text-sm text-base-content">
                When do you need it?
              </span>
            </label>
            <input
              type="date"
              className="input input-bordered bg-white rounded-box border-base-content border-opacity-20"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-sans text-sm text-base-content">
                Requirements
              </span>
              <span className="label-text-alt text-xs text-base-content">
                (Size, shape, flavour, icing, filling etc.)
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered bg-white rounded-box border-base-content border-opacity-20 min-h-32"
              placeholder="Enter requirements"
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-sans text-sm text-base-content">
                Upload a reference image
              </span>
              <span className="label-text-alt text-xs text-base-content">
                (Optional)
              </span>
            </label>
            <div className="join w-full">
              <button
                type="button"
                className="btn join-item bg-primary-100 text-primary-400 rounded-l-box"
              >
                CHOOSE A FILE
              </button>
              <input
                type="text"
                className="input input-bordered join-item bg-white rounded-r-box border-base-content border-opacity-20 flex-1"
                placeholder="cake.png"
                readOnly
              />
            </div>
            <div className="label">
              <span className="label-text-alt text-xs text-base-content">
                JPEG, PNG, HEIC
              </span>
              <span className="label-text-alt text-xs text-base-content">
                5MB max
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary bg-primary-500 text-white rounded-full h-8 shadow-btn"
          >
            <span className="font-sans text-sm font-semibold">Submit</span>
          </button>
        </form>
      </div>
    </section>
  );
}

