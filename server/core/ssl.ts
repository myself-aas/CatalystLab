import dns from 'dns';
import net from 'net';
import tls from 'tls';
import { isPrivateIp } from '../../src/lib/networkSecurity';

/**
 * Certificate days-remaining probe.
 *
 * SECURITY (owner decision, 2026-10-19 + SEC-2026-03):
 *   1. Hard-pinned to port 443 so the probe can never act as an internal port
 *      scanner.
 *   2. Uses a pinned DNS `lookup` callback that validates every resolved address
 *      with `isPrivateIp(...)` and hands that exact IP directly to the socket,
 *      closing the validate-then-connect DNS rebinding TOCTOU window.
 */
export const TLS_PROBE_PORT = 443;

export type DnsResolver = typeof dns.promises.lookup;

export function createPinnedPublicDnsLookup(
  resolver: DnsResolver = dns.promises.lookup
): net.LookupFunction {
  return (hostname: string, options: dns.LookupOptions, callback: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void) => {
    const cb = (typeof options === 'function' ? options : callback) as (
      err: NodeJS.ErrnoException | null,
      address: string | dns.LookupAddress[],
      family?: number
    ) => void;
    const allRequested = typeof options === 'object' && options !== null && Boolean(options.all);

    const bareHost = hostname.startsWith('[') && hostname.endsWith(']')
      ? hostname.slice(1, -1)
      : hostname;
    if (isPrivateIp(bareHost)) {
      cb(Object.assign(new Error(`Blocked non-public TLS probe host: ${hostname}`), { code: 'ESSRFBLOCKED' }), '');
      return;
    }

    resolver(bareHost, { all: true })
      .then((records) => {
        if (!records || records.length === 0) {
          cb(Object.assign(new Error(`No DNS records for ${hostname}`), { code: 'ENOTFOUND' }), '');
          return;
        }
        for (const rec of records) {
          if (isPrivateIp(rec.address)) {
            cb(
              Object.assign(
                new Error(`TLS probe host ${hostname} resolved to non-public IP ${rec.address}`),
                { code: 'ESSRFBLOCKED' }
              ),
              ''
            );
            return;
          }
        }
        if (allRequested) {
          cb(null, records);
        } else {
          cb(null, records[0].address, records[0].family);
        }
      })
      .catch((err: NodeJS.ErrnoException) => {
        cb(err, '');
      });
  };
}

export function getSslDetails(
  hostname: string,
  lookup: net.LookupFunction = createPinnedPublicDnsLookup()
): Promise<{ valid: boolean; daysRemaining?: number; issuer?: string }> {
  return new Promise((resolve) => {
    let resolved = false;
    const safeResolve = (result: { valid: boolean; daysRemaining?: number; issuer?: string }) => {
      if (resolved) return;
      resolved = true;
      resolve(result);
    };

    try {
      const socket = tls.connect(
        {
          host: hostname,
          port: TLS_PROBE_PORT,
          servername: hostname,
          lookup,
          timeout: 4000
        },
        () => {
          try {
            const cert = socket.getPeerCertificate();
            if (cert && cert.valid_to) {
              const validTo = new Date(cert.valid_to);
              const now = new Date();
              const diffTime = validTo.getTime() - now.getTime();
              const daysRemaining = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
              socket.destroy();
              safeResolve({
                valid: daysRemaining > 0,
                daysRemaining,
                issuer: typeof cert.issuer === 'object' && cert.issuer !== null
                  ? Array.isArray(cert.issuer.O)
                    ? cert.issuer.O.join(', ')
                    : cert.issuer.O || cert.issuer.CN
                      ? String(cert.issuer.O || cert.issuer.CN)
                      : undefined
                  : String(cert.issuer)
              });
              return;
            }
          } catch {
            // fallback
          }
          socket.destroy();
          safeResolve({ valid: true });
        }
      );

      socket.on('error', () => {
        socket.destroy();
        safeResolve({ valid: false, daysRemaining: 0 });
      });

      socket.on('timeout', () => {
        socket.destroy();
        safeResolve({ valid: false, daysRemaining: 0 });
      });

      socket.on('close', () => {
        safeResolve({ valid: false, daysRemaining: 0 });
      });
    } catch {
      safeResolve({ valid: false });
    }
  });
}
