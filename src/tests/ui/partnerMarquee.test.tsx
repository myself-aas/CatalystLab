import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PartnerMarquee, PARTNER_LOGOS } from '../../components/home/PartnerMarquee';
import { HeroSection } from '../../components/home/HeroSection';

describe('PartnerMarquee & Viewport Layout Tests', () => {
  it('renders PartnerMarquee with monochrome official logos without text captions', () => {
    render(<PartnerMarquee />);

    // Region landmark check
    const region = screen.getByRole('region', { name: /Partner Logos Marquee/i });
    expect(region).toBeInTheDocument();

    // Verify logos exist by aria-label
    const expectedPartners = ['GitHub', 'Vercel', 'Cloudflare', 'Supabase'];
    expectedPartners.forEach((partnerName) => {
      const logos = screen.getAllByLabelText(partnerName);
      expect(logos.length).toBeGreaterThanOrEqual(1);
    });

    // Ensure NO text descriptions or headings like "OFFICIAL PARTNERS" or "edge platform" exist
    expect(screen.queryByText(/OFFICIAL PARTNERS/i)).toBeNull();
    expect(screen.queryByText(/ECOSYSTEM/i)).toBeNull();
    expect(screen.queryByText(/edge platform/i)).toBeNull();

    // Check partner logos list length
    expect(PARTNER_LOGOS.length).toBeGreaterThanOrEqual(4);
  });

  it('ensures partner links have secure external link attributes', () => {
    render(<PartnerMarquee />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(4);

    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    // Verify official URL mapping for key partners
    const githubLink = screen.getAllByLabelText('GitHub')[0];
    expect(githubLink).toHaveAttribute('href', 'https://github.com');

    const vercelLink = screen.getAllByLabelText('Vercel')[0];
    expect(vercelLink).toHaveAttribute('href', 'https://vercel.com');

    const cloudflareLink = screen.getAllByLabelText('Cloudflare')[0];
    expect(cloudflareLink).toHaveAttribute('href', 'https://cloudflare.com');

    const supabaseLink = screen.getAllByLabelText('Supabase')[0];
    expect(supabaseLink).toHaveAttribute('href', 'https://supabase.com');
  });

  it('renders HeroSection integrating both 2.5/3 carousel and 0.5/3 partner marquee', () => {
    const { container } = render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>
    );

    // Verify marquee region exists within HeroSection
    const marqueeRegion = screen.getByRole('region', { name: /Partner Logos Marquee/i });
    expect(marqueeRegion).toBeInTheDocument();

    // Verify viewport height allocations
    const carouselContainer = container.querySelector('div[class*="h-[calc(100dvh*2.5/3)]"]');
    expect(carouselContainer).toBeInTheDocument();

    const marqueeContainer = container.querySelector('div[class*="h-[calc(100dvh*0.5/3)]"]');
    expect(marqueeContainer).toBeInTheDocument();
  });
});
