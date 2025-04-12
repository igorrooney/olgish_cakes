interface Window {
  gtag: (
    command: "consent" | "config" | "event",
    action: string,
    params?: {
      analytics_storage?: "granted" | "denied";
      functionality_storage?: "granted" | "denied";
      personalization_storage?: "granted" | "denied";
      [key: string]: any;
    }
  ) => void;
}

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
