import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  // Generate structured data for Google Search BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.catalystlab.tech/',
      },
      ...items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 2,
        name: item.label,
        ...(item.href ? { item: item.href.startsWith('http') ? item.href : `https://www.catalystlab.tech${item.href}` } : {}),
      })),
    ],
  };

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center text-xs text-[#64748b] ${className}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5 list-none m-0 p-0">
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-1 text-[#64748b] hover:text-[#0b192c] transition-colors font-medium"
            title="CatalystLab Home"
          >
            <Home className="h-3 w-3" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-[#94a3b8] shrink-0" aria-hidden="true" />
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-[#64748b] hover:text-[#0b192c] transition-colors font-medium hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className={`font-semibold ${isLast ? 'text-[#0b192c] truncate max-w-[280px] sm:max-w-md' : 'text-[#64748b]'}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
