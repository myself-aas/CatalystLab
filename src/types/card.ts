export type TrailDifficulty = 'Easy' | 'Moderate' | 'Hard' | 'Expert';

export interface TrailMetrics {
  distanceKm: number;      // Displayed as "${value}km"
  elevationMeters: number; // Displayed as "${value}m"
  durationMinutes: number; // Computed and formatted to "Xh Ym" format
}

export interface TrailCardProps {
  id: string;
  title: string;          // e.g., "Embercrest Ridge"
  subtitle: string;       // e.g., "Silverpine Mountains"
  imageUrl: string;       // Background image source
  imageAltText?: string;
  difficulty: TrailDifficulty;
  metadataSubtext?: string; // e.g., "1886 by Helen Rowe & Elias Mendez"
  mapIconUrl?: string;     // Custom pin map component or image path
  metrics: TrailMetrics;
  onCardPress?: (id: string) => void;
  onMapIconPress?: (id: string) => void;
  className?: string;
}

export interface TrailCardHeaderProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAltText?: string;
}

export interface TrailCardMiddleRowProps {
  difficulty: TrailDifficulty;
  metadataSubtext?: string;
  mapIconUrl?: string;
  onMapIconPress?: () => void;
}

export interface TrailCardMetricsGridProps {
  metrics: TrailMetrics;
}
