/**
 * Critical CSS utilities for performance optimization
 */

// Critical CSS for above-the-fold content
export const criticalCSS = `
  /* Critical CSS for above-the-fold content */
  body {
    margin: 0;
    font-family: var(--font-inter), system-ui, arial;
    line-height: 1.6;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Critical loading states */
  .critical-loading {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .critical-loaded {
    opacity: 1;
  }

  /* Critical layout styles */
  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .min-h-screen {
    min-height: 100vh;
  }

  .flex-grow {
    flex-grow: 1;
  }

  /* Critical header styles */
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  /* Critical hero styles */
  .hero {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #005BBB 0%, #FFD700 100%);
    color: white;
    text-align: center;
  }

  /* Critical typography */
  h1, h2, h3, h4, h5, h6 {
    line-height: 1.2;
    margin-bottom: 0.5em;
    font-weight: 600;
  }

  h1 {
    font-size: clamp(2rem, 5vw, 4rem);
  }

  h2 {
    font-size: clamp(1.5rem, 4vw, 3rem);
  }

  /* Critical button styles */
  .btn-primary {
    background: #005BBB;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    background: #004499;
    transform: translateY(-1px);
  }

  /* Critical container styles */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  /* Critical navigation styles */
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-links a {
    color: inherit;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .nav-links a:hover {
    color: #005BBB;
  }

  /* Mobile critical styles */
  @media (max-width: 768px) {
    .nav-links {
      display: none;
    }

    .mobile-menu {
      display: block;
    }

    .container {
      padding: 0 0.5rem;
    }
  }

  /* Critical focus states */
  a:focus,
  button:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid #005BBB;
    outline-offset: 2px;
  }

  /* Critical loading animation */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }
`;

// Function to inject critical CSS
export function injectCriticalCSS(): string {
  return `
    <style id="critical-css">
      ${criticalCSS}
    </style>
  `;
}

// Function to remove critical CSS after main CSS loads
export function removeCriticalCSS(): void {
  if (typeof window !== 'undefined') {
    const criticalCSSElement = document.getElementById('critical-css');
    if (criticalCSSElement) {
      criticalCSSElement.remove();
    }
  }
}

// Function to check if main CSS is loaded
export function isMainCSSLoaded(): boolean {
  if (typeof window !== 'undefined') {
    const styleSheets = Array.from(document.styleSheets);
    return styleSheets.some(sheet => 
      sheet.href && (
        sheet.href.includes('_next/static/css') ||
        sheet.href.includes('globals.css')
      )
    );
  }
  return false;
}

// Function to handle CSS loading
export function handleCSSLoading(): void {
  if (typeof window !== 'undefined') {
    // Remove critical CSS after main CSS loads
    const checkCSSLoaded = () => {
      if (isMainCSSLoaded()) {
        removeCriticalCSS();
        document.body.classList.remove('critical-loading');
        document.body.classList.add('critical-loaded');
      } else {
        // Check again after a short delay
        setTimeout(checkCSSLoaded, 100);
      }
    };

    // Start checking after a short delay
    setTimeout(checkCSSLoaded, 50);
  }
} 