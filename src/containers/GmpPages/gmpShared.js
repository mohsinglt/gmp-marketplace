import React from 'react';

// Shared constants and icons for the coded Global Marketplace pages.

export const AGENCY_SEARCH = '/s/agency-services';
export const serviceSearch = key => `${AGENCY_SEARCH}?pub_services=has_all%3A${key}`;

// Order and icons for the ten service categories. Labels come from the hosted listing field
// "services" when available, with these as fallbacks.
export const CATEGORIES = [
  { key: 'web_software_apps', label: 'Web & software', icon: 'M3 4h18v12H3zM8 20h8M12 16v4' },
  {
    key: 'ai_automation',
    label: 'AI & automation',
    icon: 'M5 8h14v11H5zM12 4v4M9 13h.01M15 13h.01M9 16h6',
  },
  { key: 'data_analytics', label: 'Data & analytics', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
  {
    key: 'cloud_devops',
    label: 'Cloud & DevOps',
    icon: 'M17.5 19a4.5 4.5 0 1 0-1.4-8.8A6 6 0 0 0 4.5 12 3.5 3.5 0 0 0 6 19h11.5z',
  },
  { key: 'digital_marketing', label: 'Marketing & SEO', icon: 'm3 17 6-6 4 4 8-8M15 7h6v6' },
  {
    key: 'accounting',
    label: 'Accounting',
    icon: 'M6 2h12v20l-3-2-3 2-3-2-3 2V2zM9 7h6M9 11h6M9 15h3',
  },
  {
    key: 'design_video',
    label: 'Design & video',
    icon: 'M12 22a10 10 0 1 1 10-10M13.5 6.5h.01M6.5 12.5h.01M17.5 15.5h.01',
  },
  { key: 'architecture', label: 'Architecture', icon: 'M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6' },
  {
    key: 'ecommerce',
    label: 'E-commerce',
    icon: 'M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6',
  },
  {
    key: 'remote_staffing',
    label: 'Remote staffing',
    icon: 'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M19 8v6M16 11h6',
  },
];

export const COUNTRY_LABELS = {
  pakistan: 'Pakistan',
  india: 'India',
  united_kingdom: 'United Kingdom',
  united_states: 'United States',
  canada: 'Canada',
};

export const Icon = ({ path, className, size = 22 }) => (
  <svg
    className={className}
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} fill="none" />
  </svg>
);

export const ShieldIcon = ({ className, size = 15 }) => (
  <svg className={className} aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 2 4 5v7c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V5l-8-3z" />
    <path
      d="m8.5 12 2.3 2.3L15.5 9.6"
      stroke="#fff"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
