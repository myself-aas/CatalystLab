import * as tls from 'tls';
import * as dns from 'dns';
import type {
  SslStatusInfo,
  SecurityDiagnosticProfile,
  SubdomainDiscoveryRecord,
  InfrastructureGrowthSummary,
  SpoofingRiskLevel,
  ProtectionStatus
} from '../types';

/**
 * Universal SSL/TLS Metadata Analyzer
 * Extracts is_expired, days_until_expiration, encryption_algorithm, issuer and validation alerts.
 */
/**
 * SECURITY (owner decision, 2026-10-19): TLS metadata analysis is pinned to
 * port 443 so the analyzer cannot be pointed at arbitrary internal ports.
 */
export const SSL_ANALYSIS_PORT = 443;

export async function getSslCertificateInfo(rawHostname: string): Promise<SslStatusInfo> {
  const cleanHost = rawHostname
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split(':')[0]
    .trim();

  return new Promise((resolve) => {
    try {
      const socket = tls.connect(
        {
          host: cleanHost,
          port: SSL_ANALYSIS_PORT,
          servername: cleanHost,
          timeout: 4500,
          rejectUnauthorized: false
        },
        () => {
          try {
            const cert = socket.getPeerCertificate();
            const cipher = socket.getCipher();
            const protocol = socket.getProtocol() || 'TLSv1.3';
            const cipherName = cipher?.name || 'TLS_AES_256_GCM_SHA384';
            const encryption_algorithm = `${cipherName} (${protocol})`;

            if (cert && cert.valid_to) {
              const validTo = new Date(cert.valid_to);
              const validFrom = cert.valid_from ? new Date(cert.valid_from).toISOString() : undefined;
              const now = new Date();
              const diffTime = validTo.getTime() - now.getTime();
              const days_until_expiration = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
              const is_expired = days_until_expiration <= 0;

              let validation_alert: 'Secure' | 'Warning: Expiring Soon' | 'Critical: Expired/Missing' = 'Secure';
              if (is_expired) {
                validation_alert = 'Critical: Expired/Missing';
              } else if (days_until_expiration <= 30) {
                validation_alert = 'Warning: Expiring Soon';
              }

              let issuerStr = "Let's Encrypt / GlobalSign";
              if (cert.issuer) {
                if (typeof cert.issuer === 'object') {
                  issuerStr = (cert.issuer as any).O || (cert.issuer as any).CN || "Let's Encrypt Authority";
                  if (Array.isArray(issuerStr)) issuerStr = issuerStr.join(', ');
                } else {
                  issuerStr = String(cert.issuer);
                }
              }

              socket.destroy();
              resolve({
                measured: true,
                is_expired,
                days_until_expiration,
                encryption_algorithm,
                validation_alert,
                issuer: String(issuerStr),
                valid_from: validFrom,
                valid_to: validTo.toISOString(),
                protocol
              });
              return;
            }
          } catch (err) {
            // fallback below
          }
          socket.destroy();
          resolve(getUnknownSslInfo());
        }
      );

      socket.on('error', () => {
        socket.destroy();
        resolve(getUnknownSslInfo());
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(getUnknownSslInfo());
      });
    } catch {
      resolve(getUnknownSslInfo());
    }
  });
}

/**
 * The TLS handshake did not complete. Say so instead of seeding plausible
 * certificate values from the hostname: an unmeasured certificate is unknown,
 * not "valid for N days".
 */
function getUnknownSslInfo(): SslStatusInfo {
  return {
    measured: false,
    is_expired: null,
    days_until_expiration: null,
    encryption_algorithm: null,
    validation_alert: null
  };
}

/**
 * Validates SPF and DMARC records and performs Email Spoofing Vulnerability Analysis.
 * Rule:
 * 1. SPF record MUST begin exactly with "v=spf1" (case-insensitive).
 * 2. DMARC record MUST begin exactly with "v=DMARC1" (case-insensitive).
 * 3. Spoofing Risk:
 *    - "High Risk": Both SPF and DMARC are missing or misconfigured.
 *    - "Medium Risk": Either SPF or DMARC is missing.
 *    - "Low Risk": Both protocols are structurally declared.
 */
export async function getEmailSecurityProfile(rawDomain: string): Promise<SecurityDiagnosticProfile> {
  const cleanDomain = rawDomain
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split(':')[0]
    .replace(/^www\./i, '')
    .trim();

  let hasSpf = false;
  let hasDmarc = false;
  // A resolver answer (including "no such record") is a measurement; a network
  // failure is not. Only answered lookups may be reported as "Missing".
  let spfAnswered = false;
  let dmarcAnswered = false;
  let spfRawRecord = '';
  let dmarcRawRecord = '';
  let hostingEcosystem = 'Cloud Edge Network & Authenticated Relay Infrastructure';

  // 1. Direct DNS TXT queries via Node.js dns.promises
  try {
    const txtRecords = await dns.promises.resolveTxt(cleanDomain).catch((err: NodeJS.ErrnoException) => {
      if (err?.code === 'ENOTFOUND' || err?.code === 'ENODATA') spfAnswered = true;
      return [];
    });
    if (txtRecords.length > 0) spfAnswered = true;
    for (const chunk of txtRecords) {
      const fullTxt = chunk.join(' ').trim();
      if (fullTxt.toLowerCase().startsWith('v=spf1')) {
        hasSpf = true;
        spfRawRecord = fullTxt;
        break;
      }
    }
  } catch {
    // handled below via DoH
  }

  try {
    const dmarcTxtRecords = await dns.promises.resolveTxt(`_dmarc.${cleanDomain}`).catch((err: NodeJS.ErrnoException) => {
      if (err?.code === 'ENOTFOUND' || err?.code === 'ENODATA') dmarcAnswered = true;
      return [];
    });
    if (dmarcTxtRecords.length > 0) dmarcAnswered = true;
    for (const chunk of dmarcTxtRecords) {
      const fullTxt = chunk.join(' ').trim();
      if (fullTxt.toLowerCase().startsWith('v=dmarc1')) {
        hasDmarc = true;
        dmarcRawRecord = fullTxt;
        break;
      }
    }
  } catch {
    // handled below via DoH
  }

  // 2. Fallback via DNS-over-HTTPS (Cloudflare DoH)
  if (!hasSpf) {
    try {
      const dohRes = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=TXT`, {
        headers: { Accept: 'application/dns-json' },
        signal: AbortSignal.timeout(3000)
      });
      if (dohRes.ok) {
        const data = await dohRes.json();
        if (data.Status === 0 || data.Status === 3) spfAnswered = true;
        if (data.Answer && Array.isArray(data.Answer)) {
          for (const ans of data.Answer) {
            const dataStr = (ans.data || '').replace(/^"|"$/g, '').trim();
            if (dataStr.toLowerCase().startsWith('v=spf1')) {
              hasSpf = true;
              spfRawRecord = dataStr;
              break;
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  if (!hasDmarc) {
    try {
      const dohDmarc = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(`_dmarc.${cleanDomain}`)}&type=TXT`, {
        headers: { Accept: 'application/dns-json' },
        signal: AbortSignal.timeout(3000)
      });
      if (dohDmarc.ok) {
        const data = await dohDmarc.json();
        if (data.Status === 0 || data.Status === 3) dmarcAnswered = true;
        if (data.Answer && Array.isArray(data.Answer)) {
          for (const ans of data.Answer) {
            const dataStr = (ans.data || '').replace(/^"|"$/g, '').trim();
            if (dataStr.toLowerCase().startsWith('v=dmarc1')) {
              hasDmarc = true;
              dmarcRawRecord = dataStr;
              break;
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  const spf_status: ProtectionStatus = hasSpf
    ? 'Configured'
    : spfAnswered
      ? 'Missing Protection'
      : 'Not measured';
  const dmarc_status: ProtectionStatus = hasDmarc
    ? 'Configured'
    : dmarcAnswered
      ? 'Missing Protection'
      : 'Not measured';

  let spoofing_risk_level: SpoofingRiskLevel;
  if (spf_status === 'Not measured' || dmarc_status === 'Not measured') {
    spoofing_risk_level = 'Not measured';
  } else if (!hasSpf && !hasDmarc) {
    spoofing_risk_level = 'High Risk';
  } else if (!hasSpf || !hasDmarc) {
    spoofing_risk_level = 'Medium Risk';
  } else {
    spoofing_risk_level = 'Low Risk';
  }

  // Live SSL analysis
  const ssl_status = await getSslCertificateInfo(cleanDomain);

  const tlsNote = ssl_status.measured
    ? `TLS probe negotiated ${ssl_status.encryption_algorithm}.`
    : 'The TLS probe did not complete, so certificate details are unknown.';

  let pipeline_summary = '';
  if (spoofing_risk_level === 'Low Risk') {
    pipeline_summary = `${cleanDomain} publishes both an SPF and a DMARC record. ${tlsNote}`;
  } else if (spoofing_risk_level === 'Medium Risk') {
    pipeline_summary = `${cleanDomain} is missing ${!hasSpf ? 'an SPF record' : 'a DMARC record'}, so sender verification is only partial. ${tlsNote}`;
  } else if (spoofing_risk_level === 'High Risk') {
    pipeline_summary = `${cleanDomain} publishes neither SPF nor DMARC, leaving the domain open to sender impersonation. ${tlsNote}`;
  } else {
    pipeline_summary = `DNS lookups for ${cleanDomain} did not complete, so SPF and DMARC status is unknown. ${tlsNote}`;
  }

  return {
    spf_status,
    dmarc_status,
    spoofing_risk_level,
    ssl_status,
    pipeline_summary,
    hosting_ecosystem: hostingEcosystem
  };
}

/**
 * Passive DNS Subdomain Enumeration Module for Repo Scanner.
 * Employs passive DNS discovery and certificate transparency mapping
 * to track infrastructure footprint growth.
 */
export async function enumerateSubdomains(rawTarget: string): Promise<{
  subdomains: SubdomainDiscoveryRecord[];
  infrastructure_growth: InfrastructureGrowthSummary;
}> {
  let domain = rawTarget
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split(':')[0]
    .trim();

  // If input is a GitHub repository or path, extract relevant domain
  if (domain.includes('github.com')) {
    domain = 'github.com';
  }

  const discovered = new Map<string, SubdomainDiscoveryRecord>();

  // Certificate Transparency logs are the only source here: a hostname is
  // listed because a certificate was issued for it, never because the prefix
  // looked plausible.
  try {
    const crtRes = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`, {
      headers: { 'User-Agent': 'CatalystLab-PassiveDNS/2.0' },
      signal: AbortSignal.timeout(3500)
    });
    if (crtRes.ok) {
      const data = await crtRes.json();
      if (Array.isArray(data)) {
        for (const item of data.slice(0, 60)) {
          for (const rawName of String(item.name_value || '').toLowerCase().split('\n')) {
            const name = rawName.replace(/^\*\./, '').trim();
            if (!name || !name.endsWith(domain)) continue;
            if (discovered.size >= 24) break;
            discovered.set(name, {
              subdomain: name,
              status: 'unresolved',
              type: 'A',
              discovered_at: new Date().toISOString(),
            });
          }
        }
      }
    }
  } catch {
    // No CT data: the engine reports an empty footprint rather than inventing one.
  }

  // Resolve every listed hostname; `active` now means an A record answered.
  await Promise.all(
    Array.from(discovered.values()).map(async (record) => {
      const addresses = await dns.promises.resolve4(record.subdomain).catch(() => [] as string[]);
      if (addresses.length > 0) {
        record.ip = addresses[0];
        record.status = 'active';
      }
    })
  );

  const subdomains = Array.from(discovered.values());
  const active_hosts = subdomains.filter((s) => s.status === 'active').length;

  const infrastructure_growth: InfrastructureGrowthSummary = {
    total_discovered: subdomains.length,
    active_hosts,
    // Provider attribution needs ASN lookups, which this engine does not do.
    cloud_providers: [],
    // No historical baseline is stored, so year-over-year growth is unknown.
    expansion_rate: null,
    discovery_source:
      subdomains.length > 0
        ? 'Certificate Transparency logs (crt.sh) with live A-record lookups'
        : 'No certificate transparency records were returned for this domain',
  };

  return {
    subdomains,
    infrastructure_growth,
  };
}
