// @vitest-environment node
// Owner decision (2026-10-19, question 5): the TLS certificate probe is
// restricted to port 443 so the public probe endpoint cannot be aimed at
// arbitrary internal ports.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventEmitter } from 'events';

const { connectMock } = vi.hoisted(() => ({ connectMock: vi.fn() }));

vi.mock('tls', () => ({
  default: { connect: connectMock },
  connect: connectMock
}));

const { getSslDetails, TLS_PROBE_PORT } = await import('@server/core/ssl');

interface FakeSocket extends EventEmitter {
  getPeerCertificate: () => unknown;
  destroy: () => void;
}

function fakeSocket(): FakeSocket {
  const socket = new EventEmitter() as FakeSocket;
  socket.getPeerCertificate = vi.fn();
  socket.destroy = vi.fn();
  return socket;
}

beforeEach(() => {
  connectMock.mockReset();
});

describe('TLS probe port restriction', () => {
  it('exposes 443 as the only probe port and accepts no port argument', () => {
    expect(TLS_PROBE_PORT).toBe(443);
    // One parameter (hostname): a caller cannot choose the port any more.
    expect(getSslDetails.length).toBe(1);
  });

  it('always connects to 443 with SNI and a bounded timeout', async () => {
    const socket = fakeSocket();
    socket.getPeerCertificate = () => ({
      valid_to: new Date(Date.now() + 30 * 86_400_000).toUTCString(),
      issuer: { O: 'Let’s Encrypt' }
    });
    connectMock.mockImplementation((_options: unknown, onReady: () => void) => {
      setImmediate(onReady);
      return socket;
    });

    const result = await getSslDetails('example.com');

    expect(connectMock).toHaveBeenCalledTimes(1);
    const options = connectMock.mock.calls[0][0] as { host: string; port: number; servername: string; timeout: number };
    expect(options.host).toBe('example.com');
    expect(options.port).toBe(443);
    expect(options.servername).toBe('example.com');
    expect(options.timeout).toBeLessThanOrEqual(5_000);
    expect(result.valid).toBe(true);
    expect(result.daysRemaining).toBeGreaterThanOrEqual(29);
    expect(result.issuer).toMatch(/Let’s Encrypt/);
  });

  it('reports an invalid certificate on socket error and destroys the socket', async () => {
    const socket = fakeSocket();
    connectMock.mockImplementation(() => {
      setImmediate(() => socket.emit('error', new Error('ECONNREFUSED')));
      return socket;
    });

    const result = await getSslDetails('no-such-host.example');

    expect(result).toEqual({ valid: false, daysRemaining: 0 });
    expect(socket.destroy).toHaveBeenCalled();
  });

  it('reports an invalid certificate on timeout', async () => {
    const socket = fakeSocket();
    connectMock.mockImplementation(() => {
      setImmediate(() => socket.emit('timeout'));
      return socket;
    });

    const result = await getSslDetails('slow.example');
    expect(result).toEqual({ valid: false, daysRemaining: 0 });
  });

  it('treats an expired certificate as invalid', async () => {
    const socket = fakeSocket();
    socket.getPeerCertificate = () => ({
      valid_to: new Date(Date.now() - 86_400_000).toUTCString(),
      issuer: 'Expired CA'
    });
    connectMock.mockImplementation((_options: unknown, onReady: () => void) => {
      setImmediate(onReady);
      return socket;
    });

    const result = await getSslDetails('expired.example');
    expect(result.valid).toBe(false);
    expect(result.daysRemaining).toBe(0);
  });

  it('survives a certificate the parser cannot read', async () => {
    const socket = fakeSocket();
    socket.getPeerCertificate = () => {
      throw new Error('unreadable certificate');
    };
    connectMock.mockImplementation((_options: unknown, onReady: () => void) => {
      setImmediate(onReady);
      return socket;
    });

    const result = await getSslDetails('odd.example');
    expect(result.valid).toBe(true);
    expect(result.daysRemaining).toBeUndefined();
  });

  it('fails closed when tls.connect throws synchronously', async () => {
    connectMock.mockImplementation(() => {
      throw new Error('socket factory exploded');
    });

    const result = await getSslDetails('broken.example');
    expect(result).toEqual({ valid: false });
  });
});
