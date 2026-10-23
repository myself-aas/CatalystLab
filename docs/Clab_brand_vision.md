# Clab_brand_vision.md
# Independent CatalysLab design-token specification.
# Valid YAML. Designed for local token compilation, on-device validation,
# and privacy-preserving implementation workflows.

name: CatalysLab Brand Vision
id: clab-brand-vision
version: 1.0.0
status: implementation-candidate
independent: true

alignment:
  meta_design_md: not-normative
  note: >
    This is an independent CatalysLab system. It preserves the softer surface
    language and Plus Jakarta Sans typography while repairing color, radius,
    accessibility, and token contradictions. It does not claim Meta brand
    licensing or Meta Optimistic VF usage as normative requirements.

operating_principles:
  edge_first: >
    Prefer self-hosted fonts, local token compilation, deterministic validation,
    and on-device rendering checks. Avoid remote design APIs and cloud-dependent
    runtime styling.
  privacy_preserving: >
    Do not transmit raw screenshots, DOM captures, user session data, biometric
    tensors, or climate tensors to external design-validation services.
  lightweight_max: >
    Keep the production token set small, explicit, and auditable. Unused
    Material dynamic-color tokens are omitted.
  hybrid_validation: >
    Visual similarity judgments must be gated by deterministic token checks,
    WCAG contrast formulas, geometry validation, and spacing modular checks.

principles:
  - 'Optimistic and human'
  - 'Engineered precision'
  - 'Spatial clarity'
  - 'Accessible by default'
  - 'Performance-aware surfaces'

colors:
  # Core surfaces
  canvas: '#ffffff'
  surface: '#f7f9fc'
  surface-muted: '#f0f2f5'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-inverse: '#1c1e21'
  surface-inverse-soft: '#2d3133'

  # Text
  text-primary: '#1c1e21'
  text-secondary: '#65676b'
  text-helper-large-only: '#768682'
  text-disabled: '#8a8d91'
  text-inverse: '#ffffff'
  text-inverse-muted: '#c2c6d6'
  on-surface-variant: '#424754'

  # Borders and boundaries
  border-essential: '#727786'
  border-strong: '#424754'
  border-decorative: '#e4e6eb'
  border-soft: '#c2c6d6'

  # Brand blue
  brand-primary: '#0064e0'
  brand-primary-hover: '#0059c8'
  brand-primary-pressed: '#004db0'
  brand-primary-text: '#004db0'
  brand-primary-container: '#e6ebff'
  on-brand-primary: '#ffffff'
  on-brand-primary-container: '#004db0'

  # Focus
  focus-visible: '#004db0'
  focus-ring-subtle: 'rgba(0, 77, 176, 0.24)'
  focus-on-dark: '#ffffff'

  # Neutral controls
  control-neutral: '#1c1e21'
  control-neutral-hover: '#3a3b3c'
  control-neutral-pressed: '#0a1317'

  # Sage / cool tech neutral
  sage-text: '#465652'
  sage-container: '#dff0eb'
  on-sage-container: '#101e1b'

  # Semantic status
  success: '#1e7e34'
  on-success: '#ffffff'
  success-container: '#e6f4ea'
  on-success-container: '#0b5a24'

  warning: '#f7b928'
  on-warning: '#1c1e21'
  warning-container: '#fff4d6'
  on-warning-container: '#684d00'

  danger: '#ba1a1a'
  on-danger: '#ffffff'
  danger-container: '#ffdad6'
  on-danger-container: '#93000a'

  info: '#0064e0'
  on-info: '#ffffff'
  info-container: '#e6ebff'
  on-info-container: '#004db0'

color_usage:
  brand_primary:
    allowed:
      - 'Primary action fill with on-brand-primary text'
      - 'Selected commerce or high-intent state'
      - 'Brand-significant interactive accent'
    prohibited:
      - 'Broad background fill behind readable body text'
      - 'General decorative page tint'
      - 'Sole meaning carrier without text, icon, or state label'
  brand_primary_text:
    allowed:
      - 'Links on light surfaces'
      - 'Active navigation text'
      - 'Accessible blue text where stronger contrast than brand-primary is required'
  text_helper_large_only:
    allowed:
      - 'Icons'
      - 'Decorative metadata'
      - 'Large text meeting WCAG large-text thresholds'
      - 'Non-essential visual accents'
    prohibited:
      - '12px labels'
      - '14px body text'
      - 'Small badge text'
      - 'Helper text on surface-muted'
  border_essential:
    allowed:
      - 'Input boundaries'
      - 'Card boundaries when tonal separation is insufficient'
      - 'Navigation separators'
      - 'Meaningful dividers'
  border_decorative:
    allowed:
      - 'Subtle dividers where another cue exists'
      - 'Non-essential card outlines on high-contrast backgrounds'
      - 'Decorative hairlines'
    prohibited:
      - 'Sole input boundary'
      - 'Sole focus indicator'
      - 'Sole card separation on surface-muted'
  focus_visible:
    allowed:
      - 'Keyboard focus outline'
      - 'Active form-control indication'
    prohibited:
      - 'Button background with white normal-sized text'
      - 'Low-alpha halo as the only focus cue'

typography:
  fontFamily: '"Plus Jakarta Sans", "Optimistic VF", Montserrat, Helvetica, Arial, "Noto Sans", sans-serif'
  fontFeatureSettings: 'normal'
  fontDisplay: 'swap'
  note: >
    Plus Jakarta Sans is the normative family for CatalysLab. Optimistic VF is
    listed only as an inspirational fallback and must not be treated as a
    licensed Meta asset. Do not enable ss01 or ss02 unless the loaded font
    explicitly supports those stylistic sets.

  font_loading:
    strategy: 'self-hosted variable woff2 with latin subset'
    preload_critical_faces: true
    fallback_metric_adjustment: true
    cloud_dependency: false

  display:
    fontSize: '56px'
    fontWeight: '700'
    lineHeight: '1.14'
    letterSpacing: '-0.03em'

  display_mobile:
    fontSize: '40px'
    fontWeight: '700'
    lineHeight: '1.20'
    letterSpacing: '-0.025em'

  headline_lg:
    fontSize: '40px'
    fontWeight: '600'
    lineHeight: '1.20'
    letterSpacing: '-0.02em'

  headline_lg_mobile:
    fontSize: '32px'
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: '-0.02em'

  headline_md:
    fontSize: '28px'
    fontWeight: '600'
    lineHeight: '1.29'
    letterSpacing: '-0.015em'

  headline_sm:
    fontSize: '22px'
    fontWeight: '600'
    lineHeight: '1.27'
    letterSpacing: '-0.01em'

  body_lg:
    fontSize: '18px'
    fontWeight: '400'
    lineHeight: '1.56'
    letterSpacing: '-0.005em'

  body_md:
    fontSize: '16px'
    fontWeight: '400'
    lineHeight: '1.50'
    letterSpacing: '0em'

  body_md_bold:
    fontSize: '16px'
    fontWeight: '700'
    lineHeight: '1.50'
    letterSpacing: '0em'

  body_sm:
    fontSize: '14px'
    fontWeight: '400'
    lineHeight: '1.43'
    letterSpacing: '0em'

  body_sm_bold:
    fontSize: '14px'
    fontWeight: '700'
    lineHeight: '1.43'
    letterSpacing: '0em'

  label_lg:
    fontSize: '16px'
    fontWeight: '600'
    lineHeight: '1.375'
    letterSpacing: '0.01em'

  label_md:
    fontSize: '14px'
    fontWeight: '600'
    lineHeight: '1.29'
    letterSpacing: '0.01em'

  label_sm:
    fontSize: '12px'
    fontWeight: '600'
    lineHeight: '1.33'
    letterSpacing: '0.02em'

  link_md:
    fontSize: '16px'
    fontWeight: '600'
    lineHeight: '1.50'
    letterSpacing: '0em'
    color: '{colors.brand-primary-text}'
    textDecoration: 'underline'
    textDecorationThickness: '1px'
    textUnderlineOffset: '3px'

rounded:
  xs: '4px'
  sm: '8px'
  md: '12px'
  lg: '16px'
  xl: '24px'
  xxl: '32px'
  feature: '40px'
  pill: '9999px'
  circle: '50%'

shape_usage:
  buttons: '{rounded.pill}'
  chips: '{rounded.pill}'
  badges: '{rounded.pill}'
  search_fields: '{rounded.pill}'
  inputs: '{rounded.md}'
  utility_cards: '{rounded.xl}'
  photo_cards: '{rounded.xxl}'
  feature_panels: '{rounded.feature}'
  dialogs: '{rounded.xl}'
  bottom_sheet_top_corners: '{rounded.xxl}'
  note: >
    rounded-xl is normatively 24px. It must not be interpreted as 48px.
    Pill geometry may use 9999px for robust browser behavior.

spacing:
  xxs: '4px'
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '24px'
  xl: '32px'
  xxl: '40px'
  section_sm: '48px'
  section: '64px'
  section_lg: '80px'
  hero: '120px'

layout:
  grid:
    desktop_columns: 12
    tablet_columns: 8
    mobile_columns: 4
    max_width: '1360px'
    gutter: '24px'
    gutter_mobile: '16px'
    margin: '48px'
    margin_tablet: '32px'
    margin_mobile: '20px'
  card_padding:
    default: '{spacing.lg}'
    large: '{spacing.xl}'
    photo_card: '0'
  section_rhythm:
    marketing_default: '{spacing.section_lg}'
    product_detail_default: '{spacing.section}'
    compact_stack: '{spacing.xl}'

elevation:
  level_0: 'none'
  level_1: 'none'
  level_2_hover: '0 8px 24px -4px rgba(28, 30, 33, 0.08)'
  level_3_overlay: '0 12px 32px -4px rgba(28, 30, 33, 0.12)'
  level_4_modal: '0 24px 48px -12px rgba(28, 30, 33, 0.20)'
  scrim: 'rgba(28, 30, 33, 0.60)'
  backdrop_blur_modal: '8px'
  backdrop_blur_nav_optional: '12px'

elevation_usage:
  default_cards: >
    Use tonal separation and border-essential first. Shadows are not required
    for static cards.
  interactive_cards: >
    Hover elevation is permitted only for clickable cards and must preserve a
    visible border or equivalent boundary cue.
  overlays: >
    Dropdowns, popovers, menus, and modals may use level_3 or level_4.
  performance: >
    Backdrop blur is optional, capability-gated, and must have an opaque
    fallback for low-power devices and reduced-transparency preferences.

motion:
  duration_fast: '150ms'
  duration_base: '200ms'
  duration_slow: '300ms'
  easing_standard: 'cubic-bezier(0.2, 0, 0, 1)'
  easing_exit: 'cubic-bezier(0.4, 0, 1, 1)'
  press_scale: '0.98'
  reduced_motion:
    press_scale: '1'
    duration_fast: '0ms'
    duration_base: '0ms'
    duration_slow: '0ms'
    disable_transform_animations: true
    disable_parallax: true

components:
  button_primary:
    backgroundColor: '{colors.brand-primary}'
    textColor: '{colors.on-brand-primary}'
    typography: '{typography.label_md}'
    rounded: '{rounded.pill}'
    minHeight: '48px'
    padding: '12px 24px'
    borderWidth: '0'
    states:
      hover:
        backgroundColor: '{colors.brand-primary-hover}'
      pressed:
        backgroundColor: '{colors.brand-primary-pressed}'
        transform: 'scale({motion.press_scale})'
      focus_visible:
        outline: '2px solid {colors.focus-visible}'
        outlineOffset: '2px'
      disabled:
        backgroundColor: '{colors.surface-container}'
        textColor: '{colors.text-disabled}'
        cursor: 'not-allowed'
    accessibility:
      contrast_pair:
        foreground: '{colors.on-brand-primary}'
        background: '{colors.brand-primary}'
        minimum_ratio: 4.5
      hover_contrast_pair:
        foreground: '{colors.on-brand-primary}'
        background: '{colors.brand-primary-hover}'
        minimum_ratio: 4.5

  button_secondary:
    backgroundColor: '{colors.control-neutral}'
    textColor: '{colors.text-inverse}'
    typography: '{typography.label_md}'
    rounded: '{rounded.pill}'
    minHeight: '48px'
    padding: '12px 24px'
    borderWidth: '0'
    states:
      hover:
        backgroundColor: '{colors.control-neutral-hover}'
      pressed:
        backgroundColor: '{colors.control-neutral-pressed}'
        transform: 'scale({motion.press_scale})'
      focus_visible:
        outline: '2px solid {colors.focus-visible}'
        outlineOffset: '2px'
      disabled:
        backgroundColor: '{colors.surface-container}'
        textColor: '{colors.text-disabled}'

  button_tertiary:
    backgroundColor: 'transparent'
    textColor: '{colors.text-primary}'
    typography: '{typography.label_md}'
    rounded: '{rounded.pill}'
    minHeight: '48px'
    padding: '10px 20px'
    border: '1px solid {colors.border-essential}'
    states:
      hover:
        backgroundColor: '{colors.surface-muted}'
      pressed:
        backgroundColor: '{colors.surface-container}'
        transform: 'scale({motion.press_scale})'
      focus_visible:
        outline: '2px solid {colors.focus-visible}'
        outlineOffset: '2px'
      disabled:
        borderColor: '{colors.border-decorative}'
        textColor: '{colors.text-disabled}'

  button_on_dark:
    backgroundColor: '{colors.canvas}'
    textColor: '{colors.control-neutral}'
    typography: '{typography.label_md}'
    rounded: '{rounded.pill}'
    minHeight: '48px'
    padding: '12px 24px'
    states:
      hover:
        backgroundColor: '{colors.surface-muted}'
      pressed:
        backgroundColor: '{colors.surface-container}'
      focus_visible:
        outline: '2px solid {colors.focus-on-dark}'
        outlineOffset: '2px'

  button_icon:
    size: '44px'
    size_large: '48px'
    mobile_min_size: '44px'
    backgroundColor: '{colors.surface-muted}'
    iconColor: '{colors.text-primary}'
    iconSize: '20px'
    rounded: '{rounded.circle}'
    states:
      hover:
        backgroundColor: '{colors.surface-container}'
      pressed:
        backgroundColor: '{colors.surface-container-high}'
        transform: 'scale({motion.press_scale})'
      focus_visible:
        outline: '2px solid {colors.focus-visible}'
        outlineOffset: '2px'
      disabled:
        backgroundColor: '{colors.surface-container}'
        iconColor: '{colors.text-disabled}'

  chip_filter:
    minHeight: '36px'
    mobile_min_height: '44px'
    padding: '8px 16px'
    typography: '{typography.label_md}'
    rounded: '{rounded.pill}'
    unselected:
      backgroundColor: 'transparent'
      borderColor: '{colors.border-essential}'
      textColor: '{colors.text-primary}'
    selected_neutral:
      backgroundColor: '{colors.control-neutral}'
      borderColor: '{colors.control-neutral}'
      textColor: '{colors.text-inverse}'
    selected_brand:
      backgroundColor: '{colors.brand-primary}'
      borderColor: '{colors.brand-primary}'
      textColor: '{colors.on-brand-primary}'
    dismiss_icon:
      color: 'currentColor'
      size: '16px'
      hit_area: '32px'
    states:
      focus_visible:
        outline: '2px solid {colors.focus-visible}'
        outlineOffset: '2px'
      disabled:
        borderColor: '{colors.border-decorative}'
        textColor: '{colors.text-disabled}'

  badge:
    height: '24px'
    padding: '0 10px'
    typography: '{typography.label_sm}'
    rounded: '{rounded.pill}'
    variants:
      neutral:
        backgroundColor: '{colors.surface-muted}'
        textColor: '{colors.text-secondary}'
      info:
        backgroundColor: '{colors.info-container}'
        textColor: '{colors.on-info-container}'
      success:
        backgroundColor: '{colors.success-container}'
        textColor: '{colors.on-success-container}'
      warning:
        backgroundColor: '{colors.warning-container}'
        textColor: '{colors.on-warning-container}'
      danger:
        backgroundColor: '{colors.danger-container}'
        textColor: '{colors.on-danger-container}'
      sage:
        backgroundColor: '{colors.sage-container}'
        textColor: '{colors.on-sage-container}'
    rules:
      - 'Do not use text-helper-large-only as badge text.'
      - 'Do not rely on color alone; badges must include text.'
      - 'Minimum touch target for interactive badges is 44px.'

  text_input:
    height: '48px'
    backgroundColor: '{colors.canvas}'
    textColor: '{colors.text-primary}'
    borderColor: '{colors.border-essential}'
    borderWidth: '1px'
    rounded: '{rounded.md}'
    padding: '12px 16px'
    typography: '{typography.body_md}'
    placeholderColor: '{colors.text-secondary}'
    helperTextColor: '{colors.text-secondary}'
    label:
      typography: '{typography.label_md}'
      textColor: '{colors.text-primary}'
      marginBottom: '{spacing.xs}'
    states:
      focus:
        borderColor: '{colors.focus-visible}'
        boxShadow: '0 0 0 3px {colors.focus-ring-subtle}'
      error:
        borderColor: '{colors.danger}'
        helperTextColor: '{colors.danger}'
      disabled:
        backgroundColor: '{colors.surface-container}'
        borderColor: '{colors.border-decorative}'
        textColor: '{colors.text-disabled}'
    accessibility:
      boundary_contrast_minimum: 3.0
      error_must_include_text: true
      helper_text_min_contrast: 4.5

  search_pill:
    height: '48px'
    backgroundColor: '{colors.surface-muted}'
    textColor: '{colors.text-primary}'
    placeholderColor: '{colors.text-secondary}'
    borderColor: 'transparent'
    rounded: '{rounded.pill}'
    padding: '12px 20px'
    typography: '{typography.body_md}'
    iconColor: '{colors.on-surface-variant}'
    states:
      focus:
        backgroundColor: '{colors.canvas}'
        borderColor: '{colors.focus-visible}'
        boxShadow: '0 0 0 3px {colors.focus-ring-subtle}'
      hover:
        backgroundColor: '{colors.surface-container}'

  checkbox:
    size: '20px'
    hit_area: '44px'
    rounded: '{rounded.xs}'
    unchecked:
      borderColor: '{colors.border-essential}'
      backgroundColor: '{colors.canvas}'
    checked:
      backgroundColor: '{colors.brand-primary}'
      borderColor: '{colors.brand-primary}'
      iconColor: '{colors.on-brand-primary}'
    indeterminate:
      backgroundColor: '{colors.brand-primary}'
      iconColor: '{colors.on-brand-primary}'
    disabled:
      backgroundColor: '{colors.surface-container}'
      borderColor: '{colors.border-decorative}'
      iconColor: '{colors.text-disabled}'
    focus_visible:
      outline: '2px solid {colors.focus-visible}'
      outlineOffset: '2px'

  radio:
    size: '20px'
    hit_area: '44px'
    rounded: '{rounded.circle}'
    unchecked:
      borderColor: '{colors.border-essential}'
      backgroundColor: '{colors.canvas}'
    checked:
      borderColor: '{colors.brand-primary}'
      backgroundColor: '{colors.canvas}'
      dotColor: '{colors.brand-primary}'
      dotSize: '10px'
    disabled:
      borderColor: '{colors.border-decorative}'
      backgroundColor: '{colors.surface-container}'
      dotColor: '{colors.text-disabled}'
    focus_visible:
      outline: '2px solid {colors.focus-visible}'
      outlineOffset: '2px'

  card_base:
    backgroundColor: '{colors.canvas}'
    rounded: '{rounded.xl}'
    padding: '{spacing.lg}'
    borderColor: '{colors.border-essential}'
    borderWidth: '1px'
    elevation: '{elevation.level_0}'

  card_large:
    backgroundColor: '{colors.canvas}'
    rounded: '{rounded.xl}'
    padding: '{spacing.xl}'
    borderColor: '{colors.border-essential}'
    borderWidth: '1px'
    elevation: '{elevation.level_0}'

  card_photo:
    backgroundColor: '{colors.canvas}'
    rounded: '{rounded.xxl}'
    padding: '0'
    border: 'none'
    image_behavior: 'edge-to-edge top bleed'
    content_padding: '{spacing.lg}'
    elevation: '{elevation.level_0}'

  card_interactive:
    extends: 'card_base'
    states:
      hover:
        elevation: '{elevation.level_2_hover}'
        borderColor: '{colors.border-essential}'
      pressed:
        elevation: '{elevation.level_0}'
        backgroundColor: '{colors.surface-muted}'
      focus_visible:
        outline: '2px solid {colors.focus-visible}'
        outlineOffset: '2px'

  card_dark:
    backgroundColor: '{colors.surface-inverse}'
    textColor: '{colors.text-inverse}'
    subtextColor: '{colors.text-inverse-muted}'
    rounded: '{rounded.xl}'
    padding: '{spacing.lg}'
    borderColor: 'transparent'
    cta:
      component: 'button_on_dark'
    rules:
      - 'Muted subtext on dark surfaces must use text-inverse-muted, not text-helper-large-only.'
      - 'Glass CTAs are non-normative unless placed over a validated dark scrim.'
      - 'Do not place unpredictable photography directly behind small text without an overlay.'

  list_row:
    minHeight: '48px'
    padding: '{spacing.md} {spacing.lg}'
    titleColor: '{colors.text-primary}'
    metadataColor: '{colors.text-secondary}'
    iconColor: '{colors.on-surface-variant}'
    chevronColor: '{colors.text-secondary}'
    divider:
      decorative: '{colors.border-decorative}'
      meaningful: '{colors.border-essential}'
    states:
      hover:
        backgroundColor: '{colors.surface-muted}'
      pressed:
        backgroundColor: '{colors.surface-container}'
      focus_visible:
        outline: '2px solid {colors.focus-visible}'
        outlineOffset: '-2px'

  navigation_bar:
    height: '64px'
    backgroundColor: '{colors.canvas}'
    borderBottom: '1px solid {colors.border-essential}'
    linkColor: '{colors.text-primary}'
    activeLinkColor: '{colors.brand-primary-text}'
    activeIndicator: '2px solid {colors.brand-primary-text}'
    cta: 'button_primary'
    focus_visible:
      outline: '2px solid {colors.focus-visible}'
      outlineOffset: '2px'
    optional_translucency:
      enabled_by_default: false
      backgroundColor: 'rgba(255, 255, 255, 0.85)'
      backdrop_filter: 'blur({elevation.backdrop_blur_nav_optional})'
      fallback_background_color: '{colors.canvas}'
      requires_contrast_validation: true
      disable_when:
        - 'prefers-reduced-transparency: reduce'
        - 'low-power device mode'
        - 'background content contrast cannot be guaranteed'

  promo_banner:
    backgroundColor: '{colors.surface-inverse}'
    textColor: '{colors.text-inverse}'
    linkColor: '{colors.text-inverse}'
    typography: '{typography.body_sm_bold}'
    padding: '{spacing.sm} {spacing.lg}'
    minHeight: '44px'
    variants:
      warning:
        backgroundColor: '{colors.warning}'
        textColor: '{colors.on-warning}'
        linkColor: '{colors.on-warning}'
    rules:
      - 'Promo banners must remain full width across breakpoints.'
      - 'Inline links must have underline or another non-color affordance.'
      - 'Do not use warning background with white text.'

  dialog:
    backgroundColor: '{colors.canvas}'
    rounded: '{rounded.xl}'
    padding: '{spacing.xl}'
    borderColor: '{colors.border-essential}'
    borderWidth: '1px'
    elevation: '{elevation.level_4_modal}'
    scrim: '{elevation.scrim}'
    backdrop_filter: 'blur({elevation.backdrop_blur_modal})'
    focus_trap: true
    close_target_min_size: '44px'
    title_typography: '{typography.headline_sm}'
    body_typography: '{typography.body_md}'

  bottom_sheet:
    backgroundColor: '{colors.canvas}'
    rounded_top: '{rounded.xxl}'
    padding: '{spacing.lg}'
    elevation: '{elevation.level_4_modal}'
    scrim: '{elevation.scrim}'
    handle:
      width: '36px'
      height: '4px'
      rounded: '{rounded.pill}'
      color: '{colors.border-essential}'
    mobile_only: true

  footer:
    backgroundColor: '{colors.canvas}'
    textColor: '{colors.text-secondary}'
    headingColor: '{colors.text-primary}'
    linkColor: '{colors.text-secondary}'
    linkHoverColor: '{colors.brand-primary-text}'
    borderTop: '1px solid {colors.border-essential}'
    padding: '{spacing.section} {spacing.xl}'
    legal_typography: '{typography.label_sm}'
    legal_color: '{colors.text-secondary}'

accessibility:
  wcag_version: '2.2 AA'
  contrast:
    normal_text_minimum: 4.5
    large_text_minimum: 3.0
    ui_components_minimum: 3.0
    focus_indicators_minimum: 3.0
  large_text_definition:
    regular_font_size_px: 24
    bold_font_size_px: 19
  touch_targets:
    minimum_px: 44
    recommended_px: 48
  keyboard:
    focus_visible_required: true
    skip_link_required: true
    logical_tab_order_required: true
  color_independence:
    required: true
    note: 'Color must never be the sole carrier of meaning. Pair status color with text, icon, shape, or pattern.'
  reduced_motion:
    required: true
    disable_press_scale: true
    disable_parallax: true
    disable_autoplay_carousels: true
  reduced_transparency:
    required: true
    disable_backdrop_blur: true
    enforce_opaque_fallback: true

  forbidden_pairs:
    - foreground: '#ffffff'
      background: '#1877f2'
      reason: 'White text on bright blue fails WCAG AA for normal-sized text.'
    - foreground: '#768682'
      background: '#ffffff'
      reason: 'Sage muted tone fails WCAG AA for normal text. Use only for large text, icons, or decorative UI.'
    - foreground: '#768682'
      background: '#f0f2f5'
      reason: 'Sage muted tone fails WCAG AA on soft neutral surfaces.'
    - foreground: '#e4e6eb'
      background: '#ffffff'
      reason: 'Pale boundary fails 3:1 non-text contrast when used as a sole meaningful control or card edge.'
    - foreground: 'rgba(0, 100, 224, 0.15)'
      background: '#ffffff'
      reason: 'Low-alpha blue halo is too weak as a sole focus indicator.'
    - foreground: '#ffffff'
      background: '#f7b928'
      reason: 'White text on warning yellow fails contrast. Use dark text on warning surfaces.'

  required_patterns:
    - 'Primary buttons must use brand-primary with on-brand-primary text.'
    - 'Primary button hover must use brand-primary-hover, not bright decorative blue.'
    - 'Inputs must use border-essential as the default meaningful boundary.'
    - 'Focus must use a solid focus-visible outline plus optional subtle ring.'
    - 'Error states must include text, not only red border or red icon.'
    - 'Disabled states are exempt from contrast minimums but must remain perceivable as disabled.'

responsive_behavior:
  breakpoints:
    mobile_small: '480px'
    mobile_large: '767px'
    tablet: '1023px'
    desktop: '1359px'
    wide_desktop: '1360px'
  rules:
    mobile_small:
      - 'Single-column layouts.'
      - 'Display type steps down to display_mobile.'
      - 'Navigation collapses to menu and essential actions.'
      - 'Cards stack vertically.'
      - 'Interactive touch targets must be at least 44px.'
    tablet:
      - 'Two-column feature grids.'
      - 'Section margins compress to 32px.'
      - 'Card groups reflow from three-up to two-up.'
    desktop:
      - 'Full grid returns.'
      - 'Section margins use 48px.'
      - 'Three-up, four-up, and six-up configurations are permitted.'
    wide_desktop:
      - 'Container locks at 1360px.'
      - 'Hero photography may expand with preserved aspect ratios.'
      - 'Gutters remain tokenized; do not introduce ad hoc spacing.'

image_behavior:
  aspect_ratios:
    thumbnail: '1 / 1'
    feature_card: '4 / 3'
    promo_strip: '16 / 9'
  loading:
    above_fold_priority: high
    below_fold: lazy
    format_preference:
      - avif
      - webp
      - jpg
  rounding:
    photo_cards: '{rounded.xxl}'
    thumbnails: '{rounded.lg}'
    swatches: '{rounded.circle}'
  accessibility:
    alt_text_required: true
    decorative_images_must_be_empty_alt: true
    text_over_image_requires_scrim_or_solid_surface: true

do_not:
  - 'Do not use rounded-xl as 48px. It is 24px in this system.'
  - 'Do not use text-helper-large-only for 12px or 14px text.'
  - 'Do not use border-decorative as the only boundary for inputs, cards, or navigation.'
  - 'Do not use bright blue #1877f2 as a button background with white text.'
  - 'Do not use warning yellow with white text.'
  - 'Do not rely on backdrop blur without an opaque fallback.'
  - 'Do not animate press scale when reduced motion is requested.'
  - 'Do not transmit raw UI captures to external services for validation.'
  - 'Do not claim Meta Optimistic VF compliance. This is an independent CatalysLab system.'

validation:
  local_commands:
    - 'npx @google/design.md lint Clab_brand_vision.md'
    - 'npx style-dictionary build'
    - 'npx axe-core-cli http://localhost:3000 --tags wcag2aa,wcag21aa'
  deterministic_checks:
    - 'Parse YAML successfully.'
    - 'Resolve all token references.'
    - 'Verify no broken keys.'
    - 'Verify no hardcoded hex values in component specs.'
    - 'Verify all normal-text pairs meet 4.5:1.'
    - 'Verify all meaningful UI boundaries meet 3:1.'
    - 'Verify all focus indicators meet 3:1 against adjacent surfaces.'
    - 'Verify touch targets are at least 44px.'
    - 'Verify reduced-motion and reduced-transparency policies are present.'
  privacy_policy:
    raw_data_local_only: true
    external_telemetry: false
    screenshot_storage: 'local encrypted cache only'
