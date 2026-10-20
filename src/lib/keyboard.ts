import type React from 'react';

/**
 * Makes a non-native interactive element keyboard-operable (WCAG 2.1.1):
 * Enter/Space dispatch the element's own click handler.
 * Prefer a real <button>/<a>; use this only where layout requires a div.
 */
export const activateOnKey = (event: React.KeyboardEvent<HTMLElement>) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.currentTarget.click();
  }
};

/** Spread onto a clickable div/span: {...clickableProps} alongside onClick. */
export const clickableProps = {
  role: 'button',
  tabIndex: 0,
  onKeyDown: activateOnKey,
} as const;
