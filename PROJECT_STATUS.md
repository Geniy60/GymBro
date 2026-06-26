# Project Status

## Current State

The project is now a minimal Expo SDK 54 / React Native / TypeScript mobile app for a personal gym assistant.

The initial app shell is in place with a compact header, safe-area handling, and two main tabs:

- Machines
- Workouts

The Machines tab now supports the first real MVP workflow: list, search, add, edit, and delete machines. Machine data is persisted locally on the device with AsyncStorage.

The Workouts tab is still a placeholder with search and an empty state.

User-facing app text is centralized in `src/strings.ts`.

## Last Completed Step

Matched the main menu and machine action buttons to the sibling Fridge app style.

Details:

- Updated the main two-tab menu to use the Fridge-style switch container with pastel tab backgrounds and a dark active border.
- Updated the Machines add button to use the Fridge-style green square button with a text plus.
- Updated machine card edit/delete actions to use compact text-icon buttons.
- Updated delete action styling to use the Fridge-style red outlined button.
- Confirmed the machine save button already matches the Fridge-style full-width green save button.
- Aligned the shared action colors with the Fridge button palette.

Previous step:

- Moved machine UI into `src/features/machines`.
- Moved the workouts placeholder into `src/features/workouts`.
- Moved shared empty-state UI into `src/components`.
- Moved AsyncStorage access for machines into `src/storage`.
- Moved shared domain types into `src/types`.
- Moved shared colors into `src/theme`.
- Kept `App.tsx` focused on the top-level app shell, tab selection, and simple screen switching.

Previous step:

- Added `@react-native-async-storage/async-storage` for simple local device persistence.
- Added a machine form screen for creating and editing machines.
- Added machine cards with edit and delete actions.
- Added native delete confirmation before removing a machine.
- Added search filtering and a filtered-empty state with reset.
- Kept all Russian UI text centralized in `src/strings.ts`.

Previous step:

- Downgraded the initial Expo SDK 56 scaffold to Expo SDK 54 to match the user's requested SDK level and the sibling Fridge project's tested environment.
- Installed compatible React, React Native, Expo Status Bar, Safe Area Context, Vector Icons, React types, and TypeScript versions.
- Verified the installed top-level versions include Expo 54.0.35, React Native 0.81.5, and React 19.1.0.

Tunnel helper:

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

Manually launch `Start Expo Go Tunnel.cmd`, scan the Expo QR code with Expo Go, and verify the Machines add/edit/delete flow on a phone. After that, the simplest next feature step is making the Workouts tab useful by adding a basic workout list and a workout form.

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
- Use AsyncStorage for local-only MVP persistence until sync or multi-device usage becomes a real requirement.

## Known Rough Edges

- The settings button is visual only; no settings screen exists yet.
- The Workouts tab does not have real data, add screens, edit screens, or persistence yet.
- Machine IDs currently use a timestamp string, which is sufficient for this local personal MVP but can be replaced later if needed.
- `npm audit` reports moderate vulnerabilities from the generated Expo and tunnel dependency tree; no remediation was applied because automatic fixes could affect Expo SDK compatibility.
