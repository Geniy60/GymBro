# Project Status

## Current State

The project is now a minimal Expo SDK 54 / React Native / TypeScript mobile app for a personal gym assistant.

The initial app shell is in place with a compact header, safe-area handling, and two main tabs:

- Machines
- Workouts

Both tabs currently show a search input and an empty state. No add/edit/delete workflow or persistence has been implemented yet.

User-facing app text is centralized in `src/strings.ts`.

## Last Completed Step

Aligned the project with Expo SDK 54.

Details:

- Downgraded the initial Expo SDK 56 scaffold to Expo SDK 54 to match the user's requested SDK level and the sibling Fridge project's tested environment.
- Installed compatible React, React Native, Expo Status Bar, Safe Area Context, Vector Icons, React types, and TypeScript versions.
- Verified the installed top-level versions include Expo 54.0.35, React Native 0.81.5, and React 19.1.0.

Previous step:

- Added `Start Expo Go Tunnel.cmd`, matching the helper pattern used in the sibling Fridge project.
- Added `@expo/ngrok` as a development dependency so `npx expo start --tunnel --clear` can run without an extra first-run install prompt.
- Kept the script focused on Expo Go tunnel startup only.

Initial app setup:

- Scaffolded an Expo TypeScript app in the project root.
- Added `react-native-safe-area-context` for safe-area layout.
- Added `@expo/vector-icons` for Ionicons used by the header and search clear action.
- Renamed the app/package metadata to GymBro.
- Implemented the root app shell with the two requested menu tabs.
- Used the requested Russian tab labels through the centralized strings file.
- Added an `npm test` script that runs the TypeScript type check.

Verified:

- `npx tsc --noEmit`
- `npm test`

## Next Proposed Step

Manually launch `Start Expo Go Tunnel.cmd`, scan the Expo QR code with Expo Go, and verify the initial two-tab UI on a phone. After that, choose the first real data workflow to implement. The simplest app feature step is adding machines CRUD before building workout composition.

## Important Decisions

- Prefer a working personal-use product over technical perfection.
- Keep changes small, incremental, easy to review, and easy to understand.
- Avoid speculative infrastructure and future-proof architecture.
- Use the existing project stack and established patterns unless there is a clear reason to change.
- Do not add a backend, Docker, microservices, CQRS, Clean Architecture, background jobs, analytics, payments, or an admin panel unless explicitly requested.
- Explain dependencies before adding them and prefer platform capabilities when they are sufficient.
- Centralize Russian UI text and avoid scattered Cyrillic literals in code and tests.
- Read `PROJECT_STATUS.md` before implementation work and update it after meaningful project steps.
- Run type checking and tests after code changes.
- For Expo Android APK builds, increment `versionCode`, submit the EAS APK build, report submission or queue status, and do not wait for the full cloud build result unless explicitly asked.
- Use Expo / React Native / TypeScript for the initial mobile MVP.
- Stay on Expo SDK 54 for now because this SDK level was requested and matches the already tested sibling project setup.
- Do not add a backend or database until there is a concrete persistence requirement.
- Use `Start Expo Go Tunnel.cmd` for phone testing through Expo Go when LAN discovery is unreliable.

## Known Rough Edges

- The settings button is visual only; no settings screen exists yet.
- The two list tabs do not have real data, add screens, edit screens, or persistence yet.
- `npm audit` reports moderate vulnerabilities from the generated Expo and tunnel dependency tree; no remediation was applied because automatic fixes could affect Expo SDK compatibility.
