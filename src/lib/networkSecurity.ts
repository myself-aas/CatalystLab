import { URL } from 'url';
import dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

/**
 * Checks whether an IPv4 address falls within private, loopback, link-local,
 * or cloud provider instance metadata ranges.
 */
export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;

  // Normalize IPv6-mapped IPv4 addresses (e.g. "::ffff:127.0.0.1")
  const v4 = ip.startsWith('::ffff:') ? ip.substring(7) : ip;

  // IPv6 checks
  if (v4.includes(':')) {
    const lower = v4.toLowerCase();
    if (lower === '::1' || lower === '::') return true; // Loopback / Unspecified
    if (lower.startsWith('fe80:')) return true; // Link-local
    if (lower.startsWith('fc00:') || lower.startsWith('fd00:')) return true; // Unique Local Address
    return false;
  }

  const parts = v4.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Invalid format
  }

  const [p0, p1] = parts;

  // 0.0.0.0/8 (Current network)
  if (p0 === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (p0 === 127) return true;

  // 10.0.0.0/8 (Private RFC 1918)
  if (p0 === 10) return true;

  // 172.16.0.0/12 (Private RFC 1918)
  if (p0 === 172 && p1 >= 16 && p1 <= 31) return true;

  // 192.168.0.0/16 (Private RFC 1918)
  if (p0 === 192 && p1 === 168) return true;

  // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Cloud Metadata API 169.254.169.254)
  if (p0 === 169 && p1 === 254) return true;

  // 100.64.0.0/10 (Shared Address Space / CGNAT)
  if (p0 === 100 && p1 >= 64 && p1 <= 127) return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (p0 >= 224) return true;

  return false;
}

/**
 * Validates whether a target URL is safe for outbound telemetry auditing,
 * blocking SSRF attacks, internal service probing, and loopback exploits.
 */
export async function validatePublicUrl(rawUrl: string, isRepo: boolean = false): Promise<{
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
  hostname?: string;
  ip?: string;
}> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string.' };
  }

  let clean = rawUrl.trim();

  // Allow repo URLs for Git engine
  if (isRepo) {
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
  } else {
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(clean);
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }

  // Enforce http/https protocols only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are supported.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost, local network names, and explicit reserved domains
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.localhost')
  ) {
    return { valid: false, error: 'Internal hostnames and loopback addresses cannot be audited.' };
  }

  // Resolve hostname DNS to check target IP against SSRF ranges
  try {
    const lookup = await dnsLookup(hostname);
    if (isPrivateIp(lookup.address)) {
      return {
        valid: false,
        error: `Target resolves to a private or reserved network address (${lookup.address}). Access blocked for security.`,
        hostname,
        ip: lookup.address
      };
    }

    return {
      valid: true,
      normalizedUrl: parsed.toString(),
      hostname,
      ip: lookup.address
    };
  } catch (dnsErr: any) {
    // If DNS lookup fails directly on hostname, check if it's already an IP address
    if (isPrivateIp(hostname)) {
      return {
        valid: false,
        error: 'Target IP is a private or reserved network address. Access blocked.',
        hostname
      };
    }

    // Allow standard URL through if DNS resolution is handled at connection time
    return {
      valid: true,
      normalizedUrl: parsed.toString(),
      hostname
    };
  }
}
