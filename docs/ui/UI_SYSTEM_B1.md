# UI System – MUSCLE WORSHIP (B1 Dark Iron + Red)

## Brand feel (non-negotiable)
- Warrior / Iron / Championship backstage vibe.
- Dark surfaces, high contrast, minimal neon.
- Red used sparingly as the "danger/primary action" accent.
- UI should feel heavy, serious, and disciplined (not playful).

## Semantic tokens (do not hardcode colors in components)
Surfaces: bg/app, bg/panel, bg/card, bg/elevated
Text: text/primary, text/secondary, text/muted, text/danger
Borders: border/default, border/active, border/focus
Accents: accent/primary (red), success (rare), warn (rare), info (minimal)

## Layout rules
- Desktop: left sidebar + top bar
- Mobile: bottom nav later; for now keep layout usable/responsive
- Cards for content; avoid light/white sections

## Must-have (V1)
- WalletCounter visible on every authenticated screen (can be placeholder now; live later)
