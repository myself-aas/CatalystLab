import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlateImage } from '../../components/common/PlateImage';

describe('PlateImage (audit rec 7 — modern-format plate renderer)', () => {
  it('serves AVIF first, WebP second, JPEG fallback with alt text', () => {
    const { container } = render(
      <PlateImage
        src="/assets/plate.jpg"
        webp="/assets/plate.webp"
        avif="/assets/plate.avif"
        alt="Telemetry plate"
        className="w-full"
      />,
    );
    const sources = container.querySelectorAll('source');
    expect(sources).toHaveLength(2);
    expect(sources[0].getAttribute('type')).toBe('image/avif');
    expect(sources[0].getAttribute('srcset')).toBe('/assets/plate.avif');
    expect(sources[1].getAttribute('type')).toBe('image/webp');
    const img = screen.getByRole('img', { name: 'Telemetry plate' });
    expect(img.getAttribute('src')).toBe('/assets/plate.jpg');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
    expect(img.className).toBe('w-full');
  });

  it('renders a plain fallback picture when no variants are provided', () => {
    const { container } = render(<PlateImage src="/assets/plate.jpg" alt="Plain plate" />);
    expect(container.querySelectorAll('source')).toHaveLength(0);
    expect(screen.getByRole('img', { name: 'Plain plate' })).toBeTruthy();
  });

  it('forwards eager loading for LCP plates', () => {
    render(<PlateImage src="/assets/plate.jpg" alt="Hero plate" loading="eager" />);
    expect(screen.getByRole('img', { name: 'Hero plate' }).getAttribute('loading')).toBe('eager');
  });
});
