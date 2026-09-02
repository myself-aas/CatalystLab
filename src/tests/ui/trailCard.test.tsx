import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrailCard } from '../../components/cards/TrailCard';
import { formatDuration, formatDistance, formatElevation, getDifficultyTheme } from '../../utils/cardUtils';

describe('TrailCard Unit & Accessibility Tests', () => {
  const sampleTrail = {
    id: 'embercrest-ridge',
    title: 'Embercrest Ridge',
    subtitle: 'Silverpine Mountains',
    imageUrl: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800&dpr=1',
    imageAltText: 'Embercrest Ridge summit view',
    difficulty: 'Moderate' as const,
    metadataSubtext: '1886 by Helen Rowe & Elias Mendez',
    metrics: {
      distanceKm: 14.2,
      elevationMeters: 820,
      durationMinutes: 225, // 3h 45m
    },
  };

  it('formats metrics correctly using conversion helper utilities', () => {
    expect(formatDuration(225)).toBe('3h 45m');
    expect(formatDuration(60)).toBe('1h 0m');
    expect(formatDuration(45)).toBe('0h 45m');
    expect(formatDistance(14.2)).toBe('14.2km');
    expect(formatDistance(10)).toBe('10km');
    expect(formatElevation(820)).toBe('820m');
    expect(formatElevation(820.4)).toBe('820m');
  });

  it('renders TrailCard with all visual zones, title, subtitle, metadata and metrics', () => {
    const onCardPress = vi.fn();
    const onMapIconPress = vi.fn();

    const { container } = render(
      <TrailCard
        {...sampleTrail}
        onCardPress={onCardPress}
        onMapIconPress={onMapIconPress}
      />
    );

    // 1. Header Zone
    expect(screen.getByText('Embercrest Ridge')).toBeInTheDocument();
    expect(screen.getByText('Silverpine Mountains')).toBeInTheDocument();
    const img = screen.getByAltText('Embercrest Ridge summit view');
    expect(img).toBeInTheDocument();

    // 2. Middle Row
    expect(screen.getByText('Moderate')).toBeInTheDocument();
    expect(screen.getByText('1886 by Helen Rowe & Elias Mendez')).toBeInTheDocument();

    // 3. Metrics Grid
    expect(screen.getByText('14.2km')).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('820m')).toBeInTheDocument();
    expect(screen.getByText('Elevation')).toBeInTheDocument();
    expect(screen.getByText('3h 45m')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
  });

  it('triggers onCardPress when clicked or triggered with Enter key', () => {
    const onCardPress = vi.fn();
    render(<TrailCard {...sampleTrail} onCardPress={onCardPress} />);

    const card = screen.getByRole('region', { name: /Trail card: Embercrest Ridge/i });
    fireEvent.click(card);
    expect(onCardPress).toHaveBeenCalledWith('embercrest-ridge');

    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(onCardPress).toHaveBeenCalledTimes(2);
  });

  it('triggers onMapIconPress independently without bubbling to onCardPress', () => {
    const onCardPress = vi.fn();
    const onMapIconPress = vi.fn();

    render(
      <TrailCard
        {...sampleTrail}
        onCardPress={onCardPress}
        onMapIconPress={onMapIconPress}
      />
    );

    const mapBtn = screen.getByRole('button', { name: /View map route/i });
    fireEvent.click(mapBtn);

    expect(onMapIconPress).toHaveBeenCalledWith('embercrest-ridge');
    expect(onCardPress).not.toHaveBeenCalled();
  });
});
