## LIGHT (html:not(.dark)) — text pairs (4.5:1)
| pair | ratio | req | verdict |
|---|---|---|---|
| foreground #1C1E21 on background #FFFFFF | 16.71:1 | 4.5:1 | PASS |
| muted-foreground #4B4C4F on #FFFFFF | 8.59:1 | 4.5:1 | PASS |
| muted-foreground #4B4C4F on well #F1F4F7 | 7.78:1 | 4.5:1 | PASS |
| p-text-faint #8595A4 on #FFFFFF | 3.07:1 | 4.5:1 | LARGE-ONLY |
| p-text-faint #8595A4 on well #F1F4F7 | 2.78:1 | 4.5:1 | FAIL |
| foreground-muted rgba(28,30,33,.62) on #FFFFFF | 4.70:1 | 4.5:1 | PASS |
| foreground-subtle rgba(9,13,22,.60) on #FFFFFF | 5.12:1 | 4.5:1 | PASS |
| link #0064E0 on #FFFFFF | 5.39:1 | 4.5:1 | PASS |
| accent-foreground #0457CB on #FFFFFF | 6.50:1 | 4.5:1 | PASS |
| secondary-foreground #1C1E21 on secondary #F1F4F7 | 15.13:1 | 4.5:1 | PASS |
| text-muted #2C3032 on #FFFFFF (the OTHER muted) | 13.33:1 | 4.5:1 | PASS |
| slate-400 #8595A4 on card #FFFFFF | 3.07:1 | 4.5:1 | LARGE-ONLY |
| slate-500 #5D6C7B on #FFFFFF | 5.39:1 | 4.5:1 | PASS |

## LIGHT — semantic + chart colors on white (text 4.5 / graphics 3)
| pair | ratio | req | verdict |
|---|---|---|---|
| destructive #E41E3F on #FFFFFF | 4.61:1 | 4.5:1 | PASS |
| success #1E7D34 on #FFFFFF | 5.20:1 | 4.5:1 | PASS |
| warning #9A6B0F on #FFFFFF | 4.68:1 | 4.5:1 | PASS |
| info #0091FF on #FFFFFF | 3.23:1 | 4.5:1 | LARGE-ONLY |
| color-success #047857 on #FFFFFF | 5.48:1 | 4.5:1 | PASS |
| color-warning #B45309 on #FFFFFF | 5.02:1 | 4.5:1 | PASS |
| color-danger #C81E1E on #FFFFFF | 5.74:1 | 4.5:1 | PASS |

chart/status literals (hardcoded in TSX) on white card, graphics 3:1:
| #06B6D4 cyan on #FFFFFF | 2.43:1 | 3.0:1 | FAIL |
| #10B981 green on #FFFFFF | 2.54:1 | 3.0:1 | FAIL |
| #F59E0B amber on #FFFFFF | 2.15:1 | 3.0:1 | FAIL |
| #EF4444 red on #FFFFFF | 3.76:1 | 3.0:1 | PASS |
| #00D2FF bright cyan on #FFFFFF | 1.80:1 | 3.0:1 | FAIL |
| #8A2BE2 violet on #FFFFFF | 5.96:1 | 3.0:1 | PASS |
| #0066FF blue on #FFFFFF | 4.83:1 | 3.0:1 | PASS |

## LIGHT — controls / non-text (3:1)
| pair | ratio | req | verdict |
|---|---|---|---|
| primary btn #000000 vs canvas #FFFFFF | 21.00:1 | 3.0:1 | PASS |
| primary fg #FFFFFF on primary #000000 (text) | 21.00:1 | 4.5:1 | PASS |
| buy #0064E0 vs canvas #FFFFFF | 5.39:1 | 3.0:1 | PASS |
| buy fg #FFFFFF on #0064E0 (text) | 5.39:1 | 4.5:1 | PASS |
| secondary fill #F1F4F7 vs canvas #FFFFFF | 1.10:1 | 3.0:1 | FAIL |
| secondary border #CED0D4 vs canvas #FFFFFF | 1.54:1 | 3.0:1 | FAIL |
| input border #CED0D4 vs #FFFFFF | 1.54:1 | 3.0:1 | FAIL |
| border #dadce0 vs #FFFFFF | 1.37:1 | 3.0:1 | FAIL |
| focus ring #1876F2 vs #FFFFFF | 4.27:1 | 3.0:1 | PASS |
| focus ring #0064E0 (p-input-focus) vs #FFFFFF | 5.39:1 | 3.0:1 | PASS |

## DARK (html.dark) — text pairs (4.5:1)
| pair | ratio | req | verdict |
|---|---|---|---|
| foreground #FFFFFF on bg #111827 (patch-forced) | 17.74:1 | 4.5:1 | PASS |
| card-foreground #FFFFFF on card #2C3032 (patch-forced) | 13.33:1 | 4.5:1 | PASS |
| muted-foreground rgba(255,255,255,.72) on #111827 | 9.54:1 | 4.5:1 | PASS |
| muted-foreground rgba(255,255,255,.72) on #2C3032 | 7.71:1 | 4.5:1 | PASS |
| p-text-faint rgba(240,250,255,.35) on #111827 | 3.10:1 | 4.5:1 | LARGE-ONLY |
| p-text-faint rgba(240,250,255,.35) on #2C3032 | 2.93:1 | 4.5:1 | FAIL |
| slate-500 rgba(240,250,255,.45) on #111827 | 4.31:1 | 4.5:1 | LARGE-ONLY |
| slate-500 rgba(240,250,255,.45) on #2C3032 | 3.85:1 | 4.5:1 | LARGE-ONLY |
| link #66A6FF on #111827 | 7.15:1 | 4.5:1 | PASS |
| link #66A6FF on #2C3032 | 5.37:1 | 4.5:1 | PASS |
| secondary-foreground #F0FAFF on #2C3032 | 12.58:1 | 4.5:1 | PASS |

## DARK — semantic + chart colors (text 4.5 / graphics 3) on #111827 / #2C3032
| pair | ratio | req | verdict |
|---|---|---|---|
| destructive #DC2626 on #111827 | 3.67:1 | 4.5:1 | LARGE-ONLY |
| success #31A24C on #111827 | 5.41:1 | 4.5:1 | PASS |
| warning #F7B928 on #111827 | 10.07:1 | 4.5:1 | PASS |
| info #22D3EE on #111827 | 9.82:1 | 4.5:1 | PASS |
| color-success #34D399 on #111827 | 9.23:1 | 4.5:1 | PASS |
| color-warning #FBBF24 on #111827 | 10.63:1 | 4.5:1 | PASS |
| color-danger #F87171 on #111827 | 6.41:1 | 4.5:1 | PASS |

| #06B6D4 cyan on #111827 | 7.31:1 | 3.0:1 | PASS |
| #06B6D4 cyan on #2C3032 | 5.49:1 | 3.0:1 | PASS |
| #10B981 green on #111827 | 6.99:1 | 3.0:1 | PASS |
| #10B981 green on #2C3032 | 5.25:1 | 3.0:1 | PASS |
| #F59E0B amber on #111827 | 8.26:1 | 3.0:1 | PASS |
| #F59E0B amber on #2C3032 | 6.20:1 | 3.0:1 | PASS |
| #EF4444 red on #111827 | 4.71:1 | 3.0:1 | PASS |
| #EF4444 red on #2C3032 | 3.54:1 | 3.0:1 | PASS |
| #00D2FF bright cyan on #111827 | 9.85:1 | 3.0:1 | PASS |
| #00D2FF bright cyan on #2C3032 | 7.40:1 | 3.0:1 | PASS |
| #8A2BE2 violet on #111827 | 2.98:1 | 3.0:1 | FAIL |
| #8A2BE2 violet on #2C3032 | 2.24:1 | 3.0:1 | FAIL |
| #0066FF blue on #111827 | 3.67:1 | 3.0:1 | PASS |
| #0066FF blue on #2C3032 | 2.76:1 | 3.0:1 | FAIL |

## DARK — controls / non-text (3:1)
| pair | ratio | req | verdict |
|---|---|---|---|
| primary btn #000 (patch !important) vs canvas #111827 | 1.18:1 | 3.0:1 | FAIL |
| primary btn #000 vs app-bg #0A1317 | 1.12:1 | 3.0:1 | FAIL |
| primary fg #FFFFFF on #000000 (text) | 21.00:1 | 4.5:1 | PASS |
| buy #0064E0 vs canvas #111827 | 3.29:1 | 3.0:1 | PASS |
| buy fg #FFFFFF on #0064E0 (text) | 5.39:1 | 4.5:1 | PASS |
| secondary fill #2C3032 vs canvas #111827 | 1.33:1 | 3.0:1 | FAIL |
| secondary border rgba(240,250,255,.12) on #111827 | 1.40:1 | 3.0:1 | FAIL |
| input border rgba(240,250,255,.10) on #1F2223 | 1.35:1 | 3.0:1 | FAIL |
| focus ring #66A6FF vs #111827 | 7.15:1 | 3.0:1 | PASS |
| white bento card #FFFFFF vs canvas #111827 (as shipped) | 17.74:1 | 3.0:1 | PASS |
