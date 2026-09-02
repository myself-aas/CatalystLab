import tls from 'tls';



// Helper to check SSL certificate days remaining
export function getSslDetails(hostname: string, port = 443): Promise<{ valid: boolean; daysRemaining?: number; issuer?: string }> {
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
          port,
          servername: hostname,
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
                  ? Array.isArray(cert.issuer.O) ? cert.issuer.O.join(', ') : (cert.issuer.O || cert.issuer.CN ? String(cert.issuer.O || cert.issuer.CN) : undefined)
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
    } catch {
      safeResolve({ valid: false });
    }
  });
}
