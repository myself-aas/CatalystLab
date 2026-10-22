#!/usr/bin/env python3
"""WCAG 2.1 contrast math over CatalystLab theme tokens (light + dark).
Criteria: AA normal text 4.5:1, AA large text (>=18.66px bold/>=24px) 3:1,
non-text UI/graphics (SC 1.4.11) 3:1."""

def lin(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def lum(rgb):
    r, g, b = (lin(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def over(fg, alpha, bg):
    return tuple(round(fg[i] * alpha + bg[i] * (1 - alpha)) for i in range(3))

def ratio(fg, bg):
    l1, l2 = lum(fg), lum(bg)
    if l2 > l1: l1, l2 = l2, l1
    return (l1 + 0.05) / (l2 + 0.05)

def row(label, fg, bg, kind='text'):
    bg = hexrgb(bg) if isinstance(bg, str) else bg
    if isinstance(bg, tuple) and len(bg) == 4:
        bg = over(bg[:3], bg[3], (255, 255, 255))
    if isinstance(fg, tuple) and len(fg) == 4:
        fg = over(fg[:3], fg[3], bg)
    fg = hexrgb(fg) if isinstance(fg, str) else fg
    r = ratio(fg, bg)
    thr = 3.0 if kind != 'text' else 4.5
    verdict = 'PASS' if r >= thr else ('LARGE-ONLY' if kind == 'text' and r >= 3.0 else 'FAIL')
    print(f'| {label} | {r:.2f}:1 | {thr}:1 | {verdict} |')
    return r

W = '#FFFFFF'; WELL = '#F1F4F7'; CANVAS_D = '#111827'; CARD_D = '#2C3032'; APPBG_D = '#0A1317'; CARDBG_D = '#1C1E21'

print('## LIGHT (html:not(.dark)) — text pairs (4.5:1)')
print('| pair | ratio | req | verdict |')
print('|---|---|---|---|')
row('foreground #1C1E21 on background #FFFFFF', '#1C1E21', W)
row('muted-foreground #4B4C4F on #FFFFFF', '#4B4C4F', W)
row('muted-foreground #4B4C4F on well #F1F4F7', '#4B4C4F', WELL)
row('p-text-faint #8595A4 on #FFFFFF', '#8595A4', W)
row('p-text-faint #8595A4 on well #F1F4F7', '#8595A4', WELL)
row('foreground-muted rgba(28,30,33,.62) on #FFFFFF', ((28,30,33,0.62)), W)
row('foreground-subtle rgba(9,13,22,.60) on #FFFFFF', ((9,13,22,0.60)), W)
row('link #0064E0 on #FFFFFF', '#0064E0', W)
row('accent-foreground #0457CB on #FFFFFF', '#0457CB', W)
row('secondary-foreground #1C1E21 on secondary #F1F4F7', '#1C1E21', WELL)
row('text-muted #2C3032 on #FFFFFF (the OTHER muted)', '#2C3032', W)
row('slate-400 #8595A4 on card #FFFFFF', '#8595A4', W)
row('slate-500 #5D6C7B on #FFFFFF', '#5D6C7B', W)

print()
print('## LIGHT — semantic + chart colors on white (text 4.5 / graphics 3)')
print('| pair | ratio | req | verdict |')
print('|---|---|---|---|')
for name, hx in [('destructive #E41E3F', '#E41E3F'), ('success #1E7D34', '#1E7D34'),
                 ('warning #9A6B0F', '#9A6B0F'), ('info #0091FF', '#0091FF'),
                 ('color-success #047857', '#047857'), ('color-warning #B45309', '#B45309'),
                 ('color-danger #C81E1E', '#C81E1E')]:
    row(name + ' on #FFFFFF', hx, W)
print()
print('chart/status literals (hardcoded in TSX) on white card, graphics 3:1:')
for name, hx in [('#06B6D4 cyan', '#06B6D4'), ('#10B981 green', '#10B981'),
                 ('#F59E0B amber', '#F59E0B'), ('#EF4444 red', '#EF4444'),
                 ('#00D2FF bright cyan', '#00D2FF'), ('#8A2BE2 violet', '#8A2BE2'),
                 ('#0066FF blue', '#0066FF')]:
    row(name + ' on #FFFFFF', hx, W, kind='gfx')

print()
print('## LIGHT — controls / non-text (3:1)')
print('| pair | ratio | req | verdict |')
print('|---|---|---|---|')
row('primary btn #000000 vs canvas #FFFFFF', '#000000', W, 'gfx')
row('primary fg #FFFFFF on primary #000000 (text)', '#FFFFFF', '#000000')
row('buy #0064E0 vs canvas #FFFFFF', '#0064E0', W, 'gfx')
row('buy fg #FFFFFF on #0064E0 (text)', '#FFFFFF', '#0064E0')
row('secondary fill #F1F4F7 vs canvas #FFFFFF', WELL, W, 'gfx')
row('secondary border #CED0D4 vs canvas #FFFFFF', '#CED0D4', W, 'gfx')
row('input border #CED0D4 vs #FFFFFF', '#CED0D4', W, 'gfx')
row('border #dadce0 vs #FFFFFF', '#dadce0', W, 'gfx')
row('focus ring #1876F2 vs #FFFFFF', '#1876F2', W, 'gfx')
row('focus ring #0064E0 (p-input-focus) vs #FFFFFF', '#0064E0', W, 'gfx')

print()
print('## DARK (html.dark) — text pairs (4.5:1)')
print('| pair | ratio | req | verdict |')
print('|---|---|---|---|')
row('foreground #FFFFFF on bg #111827 (patch-forced)', '#FFFFFF', CANVAS_D)
row('card-foreground #FFFFFF on card #2C3032 (patch-forced)', '#FFFFFF', CARD_D)
row('muted-foreground rgba(255,255,255,.72) on #111827', ((255,255,255,0.72)), CANVAS_D)
row('muted-foreground rgba(255,255,255,.72) on #2C3032', ((255,255,255,0.72)), CARD_D)
row('p-text-faint rgba(240,250,255,.35) on #111827', ((240,250,255,0.35)), CANVAS_D)
row('p-text-faint rgba(240,250,255,.35) on #2C3032', ((240,250,255,0.35)), CARD_D)
row('slate-500 rgba(240,250,255,.45) on #111827', ((240,250,255,0.45)), CANVAS_D)
row('slate-500 rgba(240,250,255,.45) on #2C3032', ((240,250,255,0.45)), CARD_D)
row('link #66A6FF on #111827', '#66A6FF', CANVAS_D)
row('link #66A6FF on #2C3032', '#66A6FF', CARD_D)
row('secondary-foreground #F0FAFF on #2C3032', '#F0FAFF', CARD_D)

print()
print('## DARK — semantic + chart colors (text 4.5 / graphics 3) on #111827 / #2C3032')
print('| pair | ratio | req | verdict |')
print('|---|---|---|---|')
for name, hx in [('destructive #DC2626', '#DC2626'), ('success #31A24C', '#31A24C'),
                 ('warning #F7B928', '#F7B928'), ('info #22D3EE', '#22D3EE'),
                 ('color-success #34D399', '#34D399'), ('color-warning #FBBF24', '#FBBF24'),
                 ('color-danger #F87171', '#F87171')]:
    row(name + ' on #111827', hx, CANVAS_D)
print()
for name, hx in [('#06B6D4 cyan', '#06B6D4'), ('#10B981 green', '#10B981'),
                 ('#F59E0B amber', '#F59E0B'), ('#EF4444 red', '#EF4444'),
                 ('#00D2FF bright cyan', '#00D2FF'), ('#8A2BE2 violet', '#8A2BE2'),
                 ('#0066FF blue', '#0066FF')]:
    row(name + ' on #111827', hx, CANVAS_D, kind='gfx')
    row(name + ' on #2C3032', hx, CARD_D, kind='gfx')

print()
print('## DARK — controls / non-text (3:1)')
print('| pair | ratio | req | verdict |')
print('|---|---|---|---|')
row('primary btn #000 (patch !important) vs canvas #111827', '#000000', CANVAS_D, 'gfx')
row('primary btn #000 vs app-bg #0A1317', '#000000', APPBG_D, 'gfx')
row('primary fg #FFFFFF on #000000 (text)', '#FFFFFF', '#000000')
row('buy #0064E0 vs canvas #111827', '#0064E0', CANVAS_D, 'gfx')
row('buy fg #FFFFFF on #0064E0 (text)', '#FFFFFF', '#0064E0')
row('secondary fill #2C3032 vs canvas #111827', CARD_D, CANVAS_D, 'gfx')
row('secondary border rgba(240,250,255,.12) on #111827', ((240,250,255,0.12)), CANVAS_D, 'gfx')
row('input border rgba(240,250,255,.10) on #1F2223', ((240,250,255,0.10)), '#1F2223', 'gfx')
row('focus ring #66A6FF vs #111827', '#66A6FF', CANVAS_D, 'gfx')
row('white bento card #FFFFFF vs canvas #111827 (as shipped)', W, CANVAS_D, 'gfx')
