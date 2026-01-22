"use client";

import { useState, useRef } from "react";
import { EmailIcon } from "../icons/EmailIcon";
import { PhoneIcon } from "../icons/PhoneIcon";
import { AddressIcon } from "../icons/AddressIcon";
import { OCCASION_OPTIONS } from "./formOptions";
import { useCustomCakeEnquiry } from "@/app/hooks/useCustomCakeEnquiry";
import { buildCustomCakeEnquiryFormData, isSubmissionError } from "@/app/services/customCakeEnquiry";
import { ValidatorInput } from "./ValidatorInput";
import {
  dateMinErrorMessage,
  formSchema,
  formFieldOrder,
  getReferenceImageError,
  getTodayDateInputValue,
  isDateOnOrAfterToday,
  referenceImageAccept,
  type FormValues,
} from "./mobileForm.utils";

const formInitialState: FormValues = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postcode: "",
  occasion: "",
  date: "",
  requirements: "",
};

export function MobileForm() {
  const [formData, setFormData] = useState<FormValues>(formInitialState);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const referenceImageInputRef = useRef<HTMLInputElement | null>(null);
  const minDate = getTodayDateInputValue();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState(false);

  const focusFirstErrorField = (fieldErrors: Record<string, string>) => {
    const firstErrorField = formFieldOrder.find((field) => fieldErrors[field]);
    if (!firstErrorField) {
      return;
    }
    const fieldElement = document.getElementById(firstErrorField);
    if (!fieldElement) {
      return;
    }
    fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    fieldElement.focus();
  };

  const { csrfToken, isCsrfLoading, submitMutation, submit } = useCustomCakeEnquiry({
    onSuccess: () => {
      setErrors({});
      setHasAttemptedSubmit(false);
      setHasSubmittedSuccessfully(true);
      setFormData(formInitialState);
      setReferenceImage(null);
      if (referenceImageInputRef.current) {
        referenceImageInputRef.current.value = "";
      }
    },
    onError: (error) => {
      if (isSubmissionError(error) && error.fieldErrors) {
        setErrors(error.fieldErrors);
        focusFirstErrorField(error.fieldErrors);
        return;
      }
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to submit form. Please try again.',
      });
    },
  });

  const isSubmitting = submitMutation.isPending;
  const buttonLabel = hasSubmittedSuccessfully ? "Enquiry sent" : "Send enquiry";
  const buttonClassName = hasSubmittedSuccessfully
    ? "bg-[var(--d-color-status-success-bg)] hover:bg-[var(--d-color-status-success-bg)]"
    : "bg-primary-500 hover:bg-primary-700";
  const resetSuccessState = () => {
    if (hasSubmittedSuccessfully) {
      setHasSubmittedSuccessfully(false);
      submitMutation.reset();
    }
  };
  const updateField = (
    field: keyof FormValues,
    value: string,
    shouldClearError = false
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
    resetSuccessState();
    if (shouldClearError) {
      clearFieldError(field);
    }
  };
  const clearFieldError = (field: string) => {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }
      return { ...current, [field]: "" };
    });
  };
  const handleDateChange = (value: string) => {
    if (value && !isDateOnOrAfterToday(value)) {
      setErrors((current) => ({ ...current, date: dateMinErrorMessage }));
      updateField('date', '', false);
      return;
    }
    updateField('date', value, true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setErrors({});
    submitMutation.reset();

    try {
      // Include CSRF token in submission
      if (isCsrfLoading || !csrfToken) {
        throw new Error("CSRF token not loaded. Please refresh the page and try again.");
      }

      const parsed = formSchema.safeParse({ ...formData, csrfToken });
      const fieldErrors: Record<string, string> = {};

      if (!parsed.success) {
        parsed.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
      }

      const referenceImageError = getReferenceImageError(referenceImage);
      if (referenceImageError) {
        fieldErrors.referenceImage = referenceImageError;
      }

      if (!parsed.success || Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        focusFirstErrorField(fieldErrors);
        return;
      }

      const validated = parsed.data;
      const submissionData = buildCustomCakeEnquiryFormData(validated, referenceImage);

      submit(submissionData);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to submit form. Please try again.",
      });
    }
  };

  return (
    <section className="bg-base-100 px-4 py-8">
      <div className="mx-auto flex max-w-[390px] flex-col items-center gap-6">
        <h2 className="font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[32px] text-center">
          Custom cake enquiry form
        </h2>
        <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col items-center gap-5">
          <ValidatorInput
            id="fullName"
            type="text"
            placeholder="Enter name"
            value={formData.fullName}
            label="Full Name:"
            showValidation={hasAttemptedSubmit}
            error={errors.fullName}
            required
            hintText="Enter your full name"
            onValueChange={(value) => {
              updateField("fullName", value, true);
            }}
          />
          <ValidatorInput
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            label="Email address:"
            icon={<EmailIcon />}
            showValidation={hasAttemptedSubmit}
            error={errors.email}
            required
            hintText="Enter valid email address"
            onValueChange={(value) => {
              updateField("email", value, true);
            }}
          />
          <ValidatorInput
            id="phone"
            type="tel"
            placeholder="+44 7123 456 789"
            value={formData.phone}
            label="Phone number:"
            icon={<PhoneIcon />}
            showValidation={hasAttemptedSubmit}
            error={errors.phone}
            required
            hintText="Enter valid phone number"
            onValueChange={(value) => {
              updateField("phone", value, true);
            }}
          />
          <ValidatorInput
            id="address"
            type="text"
            placeholder="Enter address line 1"
            value={formData.address}
            label="Address:"
            icon={<AddressIcon />}
            showValidation={hasAttemptedSubmit}
            error={errors.address}
            required
            hintText="Enter your address"
            onValueChange={(value) => {
              updateField("address", value, true);
            }}
          />
          <ValidatorInput
            id="city"
            type="text"
            placeholder="Enter city"
            value={formData.city}
            label="City:"
            icon={<AddressIcon />}
            showValidation={hasAttemptedSubmit}
            error={errors.city}
            required
            hintText="Enter your city"
            onValueChange={(value) => {
              updateField("city", value, true);
            }}
          />
          <ValidatorInput
            id="postcode"
            type="text"
            placeholder="Enter postcode"
            value={formData.postcode}
            label="Postcode:"
            icon={<AddressIcon />}
            showValidation={hasAttemptedSubmit}
            error={errors.postcode}
            required
            hintText="Enter your postcode"
            onValueChange={(value) => {
              updateField("postcode", value, true);
            }}
          />
          <ValidatorInput
            fieldType="select"
            id="occasion"
            value={formData.occasion ?? ""}
            label="What's the occasion?"
            labelAlt="(Optional)"
            options={OCCASION_OPTIONS}
            hintText="Select an occasion"
            onValueChange={(value) => {
              updateField("occasion", value);
            }}
          />
          <ValidatorInput
            id="date"
            type="date"
            placeholder="Select a date"
            value={formData.date}
            label="When do you need it?"
            showValidation={hasAttemptedSubmit}
            error={errors.date}
            required
            hintText="Select a date"
            labelPlacement="outside"
            inputClassName="placeholder:text-base-content placeholder:opacity-100"
            min={minDate}
            onValueChange={handleDateChange}
          />
          <ValidatorInput
            fieldType="textarea"
            id="requirements"
            value={formData.requirements ?? ""}
            label="Requirements"
            labelAlt="(Size, shape, flavour, icing, filling etc.)"
            labelLayout="stacked"
            placeholder="Enter requirements"
            hintText="Enter requirements"
            onValueChange={(value) => {
              updateField("requirements", value);
            }}
          />
          <ValidatorInput
            fieldType="upload"
            id="referenceImage"
            label="Upload a reference image"
            labelAlt="(Optional)"
            accept={referenceImageAccept}
            infoLeft="JPEG, PNG, HEIC"
            infoRight="5MB max"
            selectedFileName={referenceImage?.name}
            inputRef={referenceImageInputRef}
            error={errors.referenceImage}
            hintText="Upload a reference image"
            onFileChange={(files) => {
              const selectedFile = files?.[0] ?? null;
              const nextError = getReferenceImageError(selectedFile);
              setReferenceImage(selectedFile);
              resetSuccessState();
              if (nextError) {
                setErrors((current) => ({ ...current, referenceImage: nextError }));
                return;
              }
              clearFieldError("referenceImage");
            }}
          />
          {errors.submit && (
            <div className="alert alert-error w-full" role="alert">
              <span>{errors.submit}</span>
            </div>
          )}
          <button
            type="submit"
            className={`btn h-8 w-full rounded-full text-white shadow-btn ${buttonClassName}`}
            disabled={isSubmitting || isCsrfLoading}
            aria-busy={isSubmitting}
          >
            <span className="flex items-center justify-center gap-2 font-sans text-sm font-semibold">
              {buttonLabel}
              {isSubmitting ? (
                <span className="loading loading-spinner" aria-hidden="true"></span>
              ) : (
                <svg
                  aria-hidden="true"
                  focusable="false"
                  width="11"
                  height="10"
                  viewBox="0 0 11 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary-100"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.7774 0.084028C11.0071 0.237204 11.0692 0.547639 10.916 0.777403L4.91603 9.7774C4.83293 9.90204 4.69834 9.98286 4.54927 9.99762C4.4002 10.0124 4.25237 9.95953 4.14645 9.85361L0.146447 5.85361C-0.0488155 5.65834 -0.0488155 5.34176 0.146447 5.1465C0.341709 4.95124 0.658291 4.95124 0.853553 5.1465L4.42229 8.71523L10.084 0.222703C10.2372 -0.0070613 10.5476 -0.0691482 10.7774 0.084028Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </span>
          </button>
        </form>
      </div>
    </section>
  );
}
