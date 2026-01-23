# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-01-23

### Added
- **Design System**: Complete documentation guide with interactive examples
- **Design System**: Multi-step template, upload-area, and selection-cards documentation
- **Data Board Components**: New reusable components for dashboards
  - `chart-container`: Container for chart visualizations
  - `kpi-card`: KPI display cards
  - `objective-progress`: Progress tracking component
  - `risk-map`: Risk visualization map
- **Card Components**: New card variants
  - `card-stacked-list`: Stacked list card layout
  - `card-text-flex`: Flexible text card component

### Changed
- **Design System**: Simplified theme system with single global toggle
- **Integraciones Module**: Complete refactor of create, detail, and list views
- **Notificaciones Module**: Updated configuration, preferences, and rule creation
- **Services**: Updated multiple services for better integration
  - `api.service.ts`
  - `chart-data.service.ts`
  - `chart-library.service.ts`
  - `export.service.ts`
  - `feature-flags.service.ts`
  - `grafica-wizard.service.ts`
  - `integraciones.service.ts`
  - `notificaciones.service.ts`

### Fixed
- **Dark Mode**: Fixed CSS variable inversion issues with hardcoded zinc colors
- **Events Module**: Fixed `onTabChange` type to accept `valueChange` event type
- **Line Endings**: Normalized CRLF to LF across all files

## [Previous Releases]

### 2026-01-22
- feat(design-system): add multi-step template, upload-area, selection-cards docs
- feat(design-system): add complete design system documentation with interactive examples
- refactor(design-system): simplify theme system with single global toggle

### 2026-01-21
- fix(eventos): auto-seed defects if missing from database
- feat(eventos): add demo seed data for events
- feat(eventos): implement complete events module with templates
- refactor(integraciones): replace stats cards with table footer summary
- fix(dark-mode): use hardcoded zinc colors to prevent CSS variable inversion
