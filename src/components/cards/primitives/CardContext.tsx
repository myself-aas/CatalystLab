import React, { createContext, useContext } from 'react';
import { CardContextValue } from '../types';

export const CardContext = createContext<CardContextValue | null>(null);

export const useCardContext = (): CardContextValue => {
  const context = useContext(CardContext);
  if (!context) {
    return {
      variant: 'immersive',
      hue: 'neutral',
      active: false,
      isHovered: false,
      interactive: false,
    };
  }
  return context;
};
