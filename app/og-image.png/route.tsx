import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    backgroundColor: '#0c0c0f',
                    padding: '80px',
                    fontFamily: 'system-ui, sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background grid pattern */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage:
                            'radial-gradient(circle, #1f1f2a 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                        opacity: 0.5,
                    }}
                />

                {/* Accent glow top-right */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-120px',
                        right: '-120px',
                        width: '500px',
                        height: '500px',
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle, rgba(91,91,246,0.18) 0%, transparent 70%)',
                    }}
                />

                {/* Top: Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                    {/* Venn SVG mark */}
                    <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                        <circle cx="13" cy="16" r="7" stroke="#5b5bf6" strokeWidth="1.5" opacity="0.85" />
                        <circle cx="19" cy="16" r="7" stroke="#5b5bf6" strokeWidth="1.5" opacity="0.85" />
                        <circle cx="16" cy="16" r="2" fill="#5b5bf6" />
                    </svg>
                    <span
                        style={{
                            fontSize: '28px',
                            fontWeight: 600,
                            color: '#eeeef2',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Catalyst
                        <span style={{ fontWeight: 400, color: '#9898b0' }}>Lab</span>
                    </span>
                </div>

                {/* Center: Main content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 1 }}>
                    {/* Badge */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#18183a',
                            border: '1px solid #252560',
                            borderRadius: '100px',
                            padding: '6px 16px',
                            width: 'fit-content',
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>⚗️</span>
                        <span
                            style={{
                                fontSize: '15px',
                                color: '#7b7bf8',
                                fontWeight: 500,
                                letterSpacing: '0.02em',
                            }}
                        >
                            20 Instruments · 9 Academic Sources · Free Forever
                        </span>
                    </div>

                    {/* Headline */}
                    <div
                        style={{
                            fontSize: '64px',
                            fontWeight: 700,
                            color: '#eeeef2',
                            lineHeight: 1.1,
                            letterSpacing: '-1.5px',
                            maxWidth: '900px',
                        }}
                    >
                        Think at the edge
                        <br />
                        <span style={{ color: '#5b5bf6' }}>of knowledge.</span>
                    </div>

                    {/* Subheadline */}
                    <div
                        style={{
                            fontSize: '22px',
                            color: '#9898b0',
                            fontWeight: 400,
                            lineHeight: 1.5,
                            maxWidth: '780px',
                        }}
                    >
                        AI brainstorming instruments + automatic literature discovery.
                        Write anything — CatalystLab finds the science.
                    </div>
                </div>

                {/* Bottom: Zone badges */}
                <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
                    {[
                        { label: '💡 Zone A: Ideas', color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
                        { label: '🔬 Zone B: Analysis', color: '#e879f9', bg: 'rgba(232,121,249,0.12)' },
                        { label: '🔭 Zone C: Discovery', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
                    ].map(({ label, color, bg }) => (
                        <div
                            key={label}
                            style={{
                                backgroundColor: bg,
                                border: `1px solid ${color}30`,
                                borderRadius: '100px',
                                padding: '8px 20px',
                                fontSize: '16px',
                                fontWeight: 500,
                                color,
                            }}
                        >
                            {label}
                        </div>
                    ))}

                    {/* URL */}
                    <div
                        style={{
                            marginLeft: 'auto',
                            fontSize: '18px',
                            color: '#3c3c52',
                            fontWeight: 400,
                            alignSelf: 'center',
                            fontFamily: 'monospace',
                        }}
                    >
                        catalystlab.tech
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}