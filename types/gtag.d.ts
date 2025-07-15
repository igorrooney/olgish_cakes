declare global {
  interface Window {
    gtag: (
      command: "consent" | "config" | "event",
      action: string,
      params?: {
        analytics_storage?: "granted" | "denied";
        functionality_storage?: "granted" | "denied";
        personalization_storage?: "granted" | "denied";
        // SEO and performance tracking parameters
        cake_name?: string;
        load_time?: number;
        design_type?: string;
        price?: number;
        currency?: string;
        // Standard GA4 parameters
        event_category?: string;
        event_label?: string;
        value?: number;
        [key: string]: any;
      }
    ) => void;
  }
}

export {};
