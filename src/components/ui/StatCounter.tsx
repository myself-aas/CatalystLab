import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';

export interface StatCounterProps {
  value: number | string;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  id?: string;
}

/**
 * Parses raw stat strings like "42", "18ms", "< 2.0s", "99.9%", "0.12g"
 * into prefix, numeric value, suffix, and decimal precision.
 */
function parseStatValue(raw: number | string, overridePrefix?: string, overrideSuffix?: string, overrideDecimals?: number) {
  if (typeof raw === 'number') {
    return {
      prefix: overridePrefix || '',
      numeric: raw,
      suffix: overrideSuffix || '',
      decimals: overrideDecimals ?? (raw % 1 !== 0 ? 1 : 0),
    };
  }

  const str = raw.trim();
  const match = str.match(/^([^\d.-]*)([-+]?[0-9]*\.?[0-9]+)(.*)$/);

  if (!match) {
    return {
      prefix: overridePrefix || str,
      numeric: 0,
      suffix: overrideSuffix || '',
      decimals: 0,
      isStatic: true,
    };
  }

  const detectedPrefix = overridePrefix !== undefined ? overridePrefix : match[1];
  const detectedNumber = parseFloat(match[2]);
  const detectedSuffix = overrideSuffix !== undefined ? overrideSuffix : match[3];
  
  const decimalParts = match[2].split('.');
  const detectedDecimals = overrideDecimals ?? (decimalParts.length > 1 ? decimalParts[1].length : 0);

  return {
    prefix: detectedPrefix,
    numeric: isNaN(detectedNumber) ? 0 : detectedNumber,
    suffix: detectedSuffix,
    decimals: detectedDecimals,
    isStatic: false,
  };
}

export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  durationMs = 1400,
  decimals,
  prefix,
  suffix,
  className = '',
  id,
}) => {
  const parsed = parseStatValue(value, prefix, suffix, decimals);

  const { ref, formattedValue } = useCountUp({
    start: 0,
    end: parsed.numeric,
    durationMs,
    decimals: parsed.decimals,
    prefix: parsed.prefix,
    suffix: parsed.suffix,
    autoStartOnInView: true,
  });

  if (parsed.isStatic) {
    return (
      <span id={id} className={`font-mono tabular-nums ${className}`}>
        {value}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      id={id}
      className={`font-mono tabular-nums ${className}`}
    >
      {formattedValue}
    </span>
  );
};

export default StatCounter;
