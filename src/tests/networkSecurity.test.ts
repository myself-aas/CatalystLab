import { describe, it, expect } from 'vitest';
import { isPrivateIp, validatePublicUrl } from '../lib/networkSecurity';

describe('Network Security & SSRF Protection', () => {
  describe('isPrivateIp()', () => {
    it('should correctly identify loopback addresses as private', () => {
      expect(isPrivateIp('127.0.0.1')).toBe(true);
      expect(isPrivateIp('127.0.0.254')).toBe(true);
      expect(isPrivateIp('::1')).toBe(true);
    });

    it('should block RFC 1918 private IPv4 subnets', () => {
      // 10.0.0.0/8
      expect(isPrivateIp('10.0.0.1')).toBe(true);
      expect(isPrivateIp('10.254.12.1')).toBe(true);

      // 172.16.0.0/12
      expect(isPrivateIp('172.16.0.1')).toBe(true);
      expect(isPrivateIp('172.31.255.255')).toBe(true);
      expect(isPrivateIp('172.32.0.1')).toBe(false); // Public range

      // 192.168.0.0/16
      expect(isPrivateIp('192.168.1.1')).toBe(true);
      expect(isPrivateIp('192.168.100.254')).toBe(true);
    });

    it('should block cloud metadata API (169.254.169.254) and link-local ranges', () => {
      expect(isPrivateIp('169.254.169.254')).toBe(true);
      expect(isPrivateIp('169.254.1.1')).toBe(true);
    });

    it('should allow legitimate public IPv4 addresses', () => {
      expect(isPrivateIp('8.8.8.8')).toBe(false);
      expect(isPrivateIp('1.1.1.1')).toBe(false);
      expect(isPrivateIp('104.26.14.234')).toBe(false);
      expect(isPrivateIp('142.250.190.46')).toBe(false);
    });
  });

  describe('validatePublicUrl()', () => {
    it('should reject empty, undefined or non-string inputs', async () => {
      const res1 = await validatePublicUrl('');
      expect(res1.valid).toBe(false);

      const res2 = await validatePublicUrl(null as any);
      expect(res2.valid).toBe(false);
    });

    it('should reject internal hostnames and loopbacks', async () => {
      const res1 = await validatePublicUrl('http://localhost:3000');
      expect(res1.valid).toBe(false);

      const res2 = await validatePublicUrl('http://127.0.0.1/admin');
      expect(res2.valid).toBe(false);

      const res3 = await validatePublicUrl('https://my-service.local');
      expect(res3.valid).toBe(false);

      const res4 = await validatePublicUrl('http://instance-data.internal');
      expect(res4.valid).toBe(false);
    });

    it('should reject non-HTTP/HTTPS protocols like file:, ftp:, gopher:', async () => {
      const res1 = await validatePublicUrl('file:///etc/passwd');
      expect(res1.valid).toBe(false);

      const res2 = await validatePublicUrl('ftp://ftp.example.com');
      expect(res2.valid).toBe(false);
    });

    it('should normalize and accept valid public web URLs', async () => {
      const res = await validatePublicUrl('google.com');
      expect(res.valid).toBe(true);
      expect(res.normalizedUrl).toBe('https://google.com/');
      expect(res.hostname).toBe('google.com');
    });

    it('should accept valid Git repositories when isRepo is true', async () => {
      const res = await validatePublicUrl('https://github.com/facebook/react', true);
      expect(res.valid).toBe(true);
      expect(res.hostname).toBe('github.com');
    });
  });
});
