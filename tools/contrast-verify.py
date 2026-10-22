#!/usr/bin/env python3
"""Post-fix verification of the pairs the 2026-10-22 audit flagged."""
def lin(c):
    c/=255.0
    return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def lum(r): return 0.2126*lin(r[0])+0.7152*lin(r[1])+0.0722*lin(r[2])
def hx(h):
    h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))
def over(f,a,b): return tuple(round(f[i]*a+b[i]*(1-a)) for i in range(3))
def ratio(f,b):
    l1,l2=lum(f),lum(b)
    if l2>l1: l1,l2=l2,l1
    return (l1+0.05)/(l2+0.05)
def row(label,f,b,thr=4.5):
    if isinstance(f,tuple) and len(f)==4: f=over(f[:3],f[3],b)
    r=ratio(f,b); print(f"{'PASS' if r>=thr else 'FAIL'} {r:5.2f} ({thr}) {label}"); return r>=thr
W='#FFFFFF'; WELL='#F1F4F7'; CD='#111827'; CARD='#2C3032'
ok=True
print('-- F1/F3 dark primary pill --')
ok&=row('pill bg #F7FDFF vs canvas #111827 (gfx3)', hx('#F7FDFF'), hx(CD), 3)
ok&=row('pill text #1F2223 on #F7FDFF', hx('#1F2223'), hx('#F7FDFF'))
ok&=row('pill bg vs app-bg #0A1317 (gfx3)', hx('#F7FDFF'), hx('#0A1317'), 3)
print('-- F2 card ink (dark, inside white cards) --')
ok&=row('card ink #1C1E21 on #FFFFFF', hx('#1C1E21'), hx(W))
ok&=row('card muted #4B4C4F on #FFFFFF', hx('#4B4C4F'), hx(W))
ok&=row('inactive chip text #4B4C4F on #F1F4F7', hx('#4B4C4F'), hx(WELL))
print('-- F4 chart tokens --')
for n,h in [('L cyan #0E7490','#0E7490'),('L green #047857','#047857'),('L amber #B45309','#B45309'),('L red #C81E1E','#C81E1E'),('L cyanbr #0891B2','#0891B2'),('L violet #7C3AED','#7C3AED'),('L blue #0064E0','#0064E0')]:
    ok&=row(n+' on white (gfx3)', hx(h), hx(W), 3)
for n,h in [('D cyan #06B6D4','#06B6D4'),('D green #10B981','#10B981'),('D amber #F59E0B','#F59E0B'),('D red #EF4444','#EF4444'),('D cyanbr #00D2FF','#00D2FF'),('D violet #A78BFA','#A78BFA'),('D blue #66A6FF','#66A6FF')]:
    ok&=row(n+' on #111827 (gfx3)', hx(h), hx(CD), 3)
    ok&=row(n+' on #2C3032 (gfx3)', hx(h), hx(CARD), 3)
print('-- F6 faint tier --')
ok&=row('L faint #5D6C7B on white', hx('#5D6C7B'), hx(W))
ok&=row('L faint #5D6C7B on well', hx('#5D6C7B'), hx(WELL))
ok&=row('D faint .55 on #111827', (240,250,255,0.55), hx(CD))
ok&=row('D faint .55 on #2C3032', (240,250,255,0.55), hx(CARD))
ok&=row('D slate-500 .60 on #111827', (240,250,255,0.60), hx(CD))
ok&=row('D slate-500 .60 on #2C3032', (240,250,255,0.60), hx(CARD))
print('-- F7 control borders --')
ok&=row('L secondary/input border #8595A4 vs white (gfx3)', hx('#8595A4'), hx(W), 3)
ok&=row('D border .40 on #111827 (gfx3)', (240,250,255,0.40), hx(CD), 3)
ok&=row('D border .40 on #1F2223 (gfx3)', (240,250,255,0.40), hx('#1F2223'), 3)
print('-- F8/F9 --')
ok&=row('L placeholder #4B4C4F@.9 on white', over(hx('#4B4C4F'),0.9,hx(W)), hx(W))
ok&=row('L info #0064E0 on white', hx('#0064E0'), hx(W))
print('ALL PASS' if ok else 'SOME FAIL')
