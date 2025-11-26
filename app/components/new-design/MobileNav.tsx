"use client";

import { useState, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CLIENT_BUSINESS_INFO } from "@/lib/business-info";
import { useAnalytics } from "@/app/hooks/useAnalytics";
import { useMobileGestures } from "@/app/hooks/useMobileGestures";
import { usePerformanceMonitor } from "../PerformanceMonitor";
import { MobileBreadcrumbs } from "../MobileBreadcrumbs";

interface NavigationItem {
  name: string;
  href: string;
  megaMenu?: {
    featured: Array<{ name: string; href: string; description?: string }>;
    categories: Array<{
      title: string;
      items: Array<{ name: string; href: string }>;
    }>;
  };
  dropdown?: Array<{ name: string; href: string }>;
}

interface MobileNavProps {
  navigation: NavigationItem[];
}

const drawerId = "mobile-drawer-v2";

// Mobile menu item component using daisyUI menu pattern
const MobileMenuItem = memo(function MobileMenuItem({
  item,
  isActive,
  isOpen,
  onToggle,
  onNavigate,
  hasSubmenu,
  children,
}: {
  item: NavigationItem;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  hasSubmenu: boolean;
  children?: React.ReactNode;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    } else {
      onNavigate();
    }
  };

  return (
    <li>
      {hasSubmenu ? (
        <details open={isOpen}>
          <summary
            className={`min-h-[48px] px-4 py-3 ${
              isActive ? "bg-base-200 text-primary font-semibold" : "text-base-content"
            }`}
            onClick={handleClick}
          >
            <span className="text-lg font-medium">{item.name}</span>
            <svg
              className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          {children}
        </details>
      ) : (
        <Link
          href={item.href}
          className={`min-h-[48px] px-4 py-3 ${
            isActive ? "bg-base-200 text-primary font-semibold active" : ""
          }`}
          onClick={handleClick}
        >
          <span className="text-lg font-medium">{item.name}</span>
        </Link>
      )}
    </li>
  );
});

// Mobile submenu item component
const MobileSubmenuItem = memo(function MobileSubmenuItem({
  item,
  pathname,
  onNavigate,
  isFeatured = false,
}: {
  item: { name: string; href: string; description?: string };
  pathname: string;
  onNavigate: () => void;
  isFeatured?: boolean;
}) {
  const isActive = pathname === item.href;

  return (
    <li className={isFeatured ? "mb-2" : "mb-1"}>
      <Link
        href={item.href}
        className={`block min-h-[44px] px-4 py-2 rounded-lg transition-colors ${
          isActive
            ? "bg-primary text-primary-content font-semibold"
            : "bg-transparent text-base-content hover:bg-base-200"
        } ${isFeatured ? "px-5 py-3" : "px-4 py-2"}`}
        onClick={onNavigate}
      >
        <span className={isFeatured ? "text-base font-medium" : "text-sm"}>{item.name}</span>
        {isFeatured && item.description && (
          <p className={`text-sm mt-1 ${isActive ? "text-primary-content/80" : "text-base-content/70"}`}>
            {item.description}
          </p>
        )}
      </Link>
    </li>
  );
});

export const MobileNav = memo(function MobileNav({ navigation }: MobileNavProps) {
  const pathname = usePathname();
  const { trackMobileMenuInteraction, trackNavigation } = useAnalytics();
  const { startTimer } = usePerformanceMonitor();
  const [mobileMenuState, setMobileMenuState] = useState<Record<string, boolean>>({});

  // Track drawer open/close via checkbox changes
  const handleDrawerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        trackMobileMenuInteraction("open", "drawer");
      } else {
        setMobileMenuState({});
        trackMobileMenuInteraction("close", "drawer");
      }
    },
    [trackMobileMenuInteraction]
  );

  // Mobile gestures hook - close drawer on swipe
  const { triggerHapticFeedback } = useMobileGestures({
    onSwipeClose: () => {
      const checkbox = document.getElementById(drawerId) as HTMLInputElement;
      if (checkbox?.checked) {
        checkbox.checked = false;
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },
    enabled: true,
  });

  const toggleMobileSubmenu = useCallback(
    (menuKey: string) => {
      const endTimer = startTimer("submenuToggleTime");

      setMobileMenuState(prev => {
        const newState = {
          ...prev,
          [menuKey]: !prev[menuKey],
        };

        trackMobileMenuInteraction(newState[menuKey] ? "open" : "close", `submenu_${menuKey.toLowerCase()}`);
        triggerHapticFeedback();

        return newState;
      });

      setTimeout(endTimer, 0);
    },
    [trackMobileMenuInteraction, triggerHapticFeedback, startTimer]
  );

  const handleMobileNavigation = useCallback(() => {
    const endTimer = startTimer("navigationTime");
    const checkbox = document.getElementById(drawerId) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    }
    trackNavigation("mobile_menu", pathname);
    setTimeout(() => {
      endTimer();
    }, 300);
  }, [trackNavigation, pathname, startTimer]);

  return (
    <div className="drawer drawer-end">
      <input
        id={drawerId}
        type="checkbox"
        className="drawer-toggle"
        onChange={handleDrawerChange}
        aria-hidden="true"
      />
      <div className="drawer-side">
        <label htmlFor={drawerId} aria-label="close sidebar" className="drawer-overlay" />
        <aside className="menu bg-base-100 min-h-full w-full max-w-[320px] p-0 flex flex-col">
          {/* Mobile Header */}
          <div className="bg-gradient-to-br from-primary to-primary-focus text-primary-content p-4 relative overflow-hidden">
            <div className="flex justify-between items-center relative z-10">
              <h2 className="text-xl font-bold tracking-wide">Menu</h2>
              <label
                htmlFor={drawerId}
                aria-label="Close mobile menu"
                className="btn btn-circle btn-ghost btn-sm min-h-[56px] min-w-[56px] bg-white/10 backdrop-blur-sm hover:bg-white/20 text-primary-content"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </label>
            </div>

            {/* Order Now Button */}
            <div className="mt-4 relative z-10">
              <Link
                href="/order"
                className="btn btn-block btn-lg min-h-[48px] rounded-2xl bg-base-100 text-primary font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                onClick={handleMobileNavigation}
                aria-label="Order your custom cake now"
              >
                Order Your Cake Now
              </Link>
            </div>

            {/* Search */}
            <div className="mt-3 relative z-10">
              <form method="GET" action="/search" role="search" className="flex gap-2">
                <input
                  type="text"
                  name="q"
                  placeholder="Search site"
                  className="input input-bordered flex-1 min-h-[44px] rounded-xl bg-white"
                  aria-label="Search site"
                />
                <button
                  type="submit"
                  className="btn btn-square btn-primary min-h-[44px] min-w-[44px]"
                  aria-label="Submit search"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>
            </div>

            {/* Call Us Button */}
            <div className="mt-2 relative z-10">
              <a
                href={CLIENT_BUSINESS_INFO.telLink}
                className="btn btn-block btn-lg min-h-[48px] rounded-2xl border-2 border-base-100 bg-transparent text-base-100 font-bold hover:bg-white/15 hover:-translate-y-0.5 transition-all"
              >
                Call Us Now
              </a>
            </div>
          </div>

          {/* Mobile Navigation List */}
          <div className="flex-1 overflow-y-auto">
            {/* Breadcrumb Navigation */}
            {Object.keys(mobileMenuState).length > 0 && (
              <MobileBreadcrumbs
                items={[
                  { label: "Menu", href: "#" },
                  ...Object.entries(mobileMenuState)
                    .filter(([_, isOpen]) => isOpen)
                    .map(([menuKey]) => ({
                      label: menuKey,
                      href: `#${menuKey.toLowerCase()}`,
                    })),
                ]}
                onNavigate={href => {
                  const menuKey = href.replace("#", "");
                  if (mobileMenuState[menuKey]) {
                    toggleMobileSubmenu(menuKey);
                  }
                }}
              />
            )}

            <ul className="menu p-0">
              {navigation.map(item => {
                const isActive = pathname === item.href;
                const isMegaMenu = item.megaMenu !== undefined;
                const isDropdown = item.dropdown !== undefined;

                if (isMegaMenu) {
                  const menuKey = item.name;
                  const isSubmenuOpen = mobileMenuState[menuKey];
                  const onToggle = () => toggleMobileSubmenu(menuKey);

                  return (
                    <MobileMenuItem
                      key={item.name}
                      item={item}
                      isActive={isActive}
                      isOpen={isSubmenuOpen}
                      onToggle={onToggle}
                      onNavigate={handleMobileNavigation}
                      hasSubmenu={true}
                    >
                      {isSubmenuOpen && item.megaMenu && (
                        <ul className="bg-base-200 p-0">
                          {/* Featured Section */}
                          <li className="px-4 pt-4 pb-2">
                            <h3 className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Featured</h3>
                            <ul className="space-y-1">
                              {item.megaMenu.featured.map(featuredItem => (
                                <MobileSubmenuItem
                                  key={featuredItem.name}
                                  item={featuredItem}
                                  pathname={pathname}
                                  onNavigate={handleMobileNavigation}
                                  isFeatured={true}
                                />
                              ))}
                            </ul>
                          </li>

                          {/* Categories */}
                          {item.megaMenu.categories.map(category => (
                            <li key={category.title} className="px-4 pt-2 pb-2">
                              <h3 className="text-xs font-semibold text-base-content/70 uppercase tracking-wide mb-3">
                                {category.title}
                              </h3>
                              <ul className="space-y-1">
                                {category.items.map(categoryItem => (
                                  <MobileSubmenuItem
                                    key={categoryItem.name}
                                    item={categoryItem}
                                    pathname={pathname}
                                    onNavigate={handleMobileNavigation}
                                  />
                                ))}
                              </ul>
                            </li>
                          ))}
                        </ul>
                      )}
                    </MobileMenuItem>
                  );
                }

                if (isDropdown) {
                  const dropdownKey = item.name;
                  const isSubmenuOpen = mobileMenuState[dropdownKey];
                  const onToggle = () => toggleMobileSubmenu(dropdownKey);

                  return (
                    <MobileMenuItem
                      key={item.name}
                      item={item}
                      isActive={isActive}
                      isOpen={isSubmenuOpen}
                      onToggle={onToggle}
                      onNavigate={handleMobileNavigation}
                      hasSubmenu={true}
                    >
                      {isSubmenuOpen && item.dropdown && (
                        <ul className="bg-base-200 p-0">
                          {item.dropdown.map(dropdownItem => (
                            <MobileSubmenuItem
                              key={dropdownItem.name}
                              item={dropdownItem}
                              pathname={pathname}
                              onNavigate={handleMobileNavigation}
                            />
                          ))}
                        </ul>
                      )}
                    </MobileMenuItem>
                  );
                }

                return (
                  <MobileMenuItem
                    key={item.name}
                    item={item}
                    isActive={isActive}
                    isOpen={false}
                    onToggle={() => {}}
                    onNavigate={handleMobileNavigation}
                    hasSubmenu={false}
                  />
                );
              })}
            </ul>
          </div>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-base-300 bg-base-200">
            <p className="text-sm text-base-content/70 text-center">Real Ukrainian Honey Cakes</p>
          </div>
        </aside>
      </div>
    </div>
  );
});

