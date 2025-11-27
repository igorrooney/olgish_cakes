"use client";

import { useState, useEffect } from "react";
import { z } from "zod";

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+44\s?\(?0\)?\s?\d{4}\s?\d{3}\s?\d{3}$/, "Invalid UK phone number"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postcode: z.string().regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, "Invalid UK postcode"),
  occasion: z.string().optional(),
  date: z.string().min(1, "Please select a date"),
  requirements: z.string().optional(),
  csrfToken: z.string().min(1, "CSRF token is required"),
});

type FormData = z.infer<typeof formSchema>;

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>("");

  // Fetch CSRF token on component mount
  useEffect(() => {
    async function fetchCsrfToken() {
      try {
        const response = await fetch('/api/csrf-token');
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.token);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    }
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmitSuccess(false);

    try {
      // Include CSRF token in submission
      if (!csrfToken) {
        throw new Error('CSRF token not loaded. Please refresh the page and try again.');
      }

      const validated = formSchema.parse({ ...formData, csrfToken });
      
      const response = await fetch('/api/custom-cake-enquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
        credentials: 'same-origin', // Include cookies for CSRF validation
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Submission failed');
      }

      setSubmitSuccess(true);
      // Reset form
      setFormData({
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
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit form. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-base-100 px-6 py-8">
      <div className="flex flex-col gap-6">
        <h2 className="font-display text-2xl text-primary-700 text-center uppercase tracking-wider leading-10">
          Custom cake enquiry form
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-control">
            <label className="label" htmlFor="fullName">
              <span className="label-text font-sans text-sm text-base-content">
                Full Name:
              </span>
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter name"
              className={`input input-bordered bg-white rounded-box border-base-content border-opacity-20 ${errors.fullName ? 'input-error' : ''}`}
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                if (errors.fullName) {
                  setErrors({ ...errors, fullName: '' });
                }
              }}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            />
            {errors.fullName && (
              <div className="label">
                <span className="label-text-alt text-error" id="fullName-error" role="alert">
                  {errors.fullName}
                </span>
              </div>
            )}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="email">
              <span className="label-text font-sans text-sm text-base-content">
                Email address:
              </span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className={`input input-bordered bg-white rounded-box border-base-content border-opacity-20 ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <div className="label">
                <span className="label-text-alt text-error" id="email-error" role="alert">
                  {errors.email}
                </span>
              </div>
            )}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="phone">
              <span className="label-text font-sans text-sm text-base-content">
                Phone number:
              </span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+44 (0) 7XXX XXX XXX"
              className={`input input-bordered bg-white rounded-box border-base-content border-opacity-20 ${errors.phone ? 'input-error' : ''}`}
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (errors.phone) {
                  setErrors({ ...errors, phone: '' });
                }
              }}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <div className="label">
                <span className="label-text-alt text-error" id="phone-error" role="alert">
                  {errors.phone}
                </span>
              </div>
            )}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="address">
              <span className="label-text font-sans text-sm text-base-content">
                Address:
              </span>
            </label>
            <input
              id="address"
              type="text"
              placeholder="Enter address line 1"
              className={`input input-bordered bg-white rounded-box border-base-content border-opacity-20 ${errors.address ? 'input-error' : ''}`}
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                if (errors.address) {
                  setErrors({ ...errors, address: '' });
                }
              }}
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? 'address-error' : undefined}
            />
            {errors.address && (
              <div className="label">
                <span className="label-text-alt text-error" id="address-error" role="alert">
                  {errors.address}
                </span>
              </div>
            )}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="city">
              <span className="label-text font-sans text-sm text-base-content">
                City:
              </span>
            </label>
            <input
              id="city"
              type="text"
              placeholder="Enter city"
              className={`input input-bordered bg-white rounded-box border-base-content border-opacity-20 ${errors.city ? 'input-error' : ''}`}
              value={formData.city}
              onChange={(e) => {
                setFormData({ ...formData, city: e.target.value });
                if (errors.city) {
                  setErrors({ ...errors, city: '' });
                }
              }}
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? 'city-error' : undefined}
            />
            {errors.city && (
              <div className="label">
                <span className="label-text-alt text-error" id="city-error" role="alert">
                  {errors.city}
                </span>
              </div>
            )}
          </div>
          <div className="form-control">
            <label className="label" htmlFor="postcode">
              <span className="label-text font-sans text-sm text-base-content">
                Postcode:
              </span>
            </label>
            <input
              id="postcode"
              type="text"
              placeholder="Enter postcode"
              className={`input input-bordered bg-white rounded-box border-base-content border-opacity-20 ${errors.postcode ? 'input-error' : ''}`}
              value={formData.postcode}
              onChange={(e) => {
                setFormData({ ...formData, postcode: e.target.value });
                if (errors.postcode) {
                  setErrors({ ...errors, postcode: '' });
                }
              }}
              aria-invalid={!!errors.postcode}
              aria-describedby={errors.postcode ? 'postcode-error' : undefined}
            />
            {errors.postcode && (
              <div className="label">
                <span className="label-text-alt text-error" id="postcode-error" role="alert">
                  {errors.postcode}
                </span>
              </div>
            )}
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
            <label className="label" htmlFor="date">
              <span className="label-text font-sans text-sm text-base-content">
                When do you need it?
              </span>
            </label>
            <input
              id="date"
              type="date"
              className={`input input-bordered bg-white rounded-box border-base-content border-opacity-20 ${errors.date ? 'input-error' : ''}`}
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                if (errors.date) {
                  setErrors({ ...errors, date: '' });
                }
              }}
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? 'date-error' : undefined}
            />
            {errors.date && (
              <div className="label">
                <span className="label-text-alt text-error" id="date-error" role="alert">
                  {errors.date}
                </span>
              </div>
            )}
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
          {errors.submit && (
            <div className="alert alert-error" role="alert">
              <span>{errors.submit}</span>
            </div>
          )}
          {submitSuccess && (
            <div className="alert alert-success" role="alert">
              <span>Thank you! Your enquiry has been submitted successfully.</span>
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary bg-primary-500 text-white rounded-full h-8 shadow-btn"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            <span className="font-sans text-sm font-semibold">
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </span>
          </button>
        </form>
      </div>
    </section>
  );
}

