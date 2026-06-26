# Project Status

## Current State

The project is now a minimal Expo SDK 54 / React Native / TypeScript mobile app for a personal gym assistant.

The initial app shell is in place with a compact header, safe-area handling, and two main tabs:

- Machines
- Workouts

The Machines tab now supports the first real MVP workflow: list, search, add, edit, and delete machines. Machine data is persisted locally on the device with AsyncStorage.

The Workouts tab now starts and edits factual workout logs. A workout contains exercises selected from the Machines list, and each exercise contains individually entered sets with weight, reps, and an optional set note. Workout data is persisted locally on the device with AsyncStorage.

User-facing app text is centralized in `src/strings.ts`.

## Last Completed Step

Removed duplicate machine edit action.

Details:

- Removed the edit icon action from machine cards because tapping the card already opens the machine form.
- Machine cards now keep only the delete action as a separate icon button.

Previous step:

Adjusted workout card actions and new-workout exit prompts.

Details:

- Removed the edit icon action from workout cards because tapping the card already opens the workout.
- New workout drafts now always show the save confirmation when leaving, even if nothing was entered yet.
- Repeated workout drafts now also show the save confirmation when leaving before edits.
- Existing saved workouts still close without a prompt when opened and left unchanged.

Previous step:

Added workout repeat action.

Details:

- Workout cards now include a repeat icon action.
- Repeating a workout opens a new workout draft for today.
- The repeated draft copies the original exercises, sets, weights, reps, and set notes.
- The repeated workout receives new workout, exercise, and set IDs, so saving it creates a separate workout.
- The repeated draft follows the existing workflow and is saved only when the user finishes or chooses to save after edits.

Previous step:

Fixed unchanged workout exit behavior.

Details:

- Opening an existing workout and leaving without edits now returns to the workout list immediately.
- The save confirmation dialog is shown only when the normalized workout draft differs from the original workout.
- Workout name normalization is shared between saving and dirty checking, so trailing spaces do not create a false unsaved-change prompt.

Previous step:

Improved active workout density with collapsible notes and exercises.

Details:

- Set note button now uses an Ionicons document icon.
- Exercise collapse/expand is now the last right-side Ionicons chevron button after delete.
- Set note input is hidden by default.
- Each set row now has a compact note button beside the delete button.
- Tapping the note button shows or hides the note input.
- Sets with existing notes keep the note input visible.
- Each machine/exercise card can now be collapsed and expanded.
- Collapsed machine cards keep a set-count summary visible.

Previous step:

- Machines already added to the current workout are highlighted in the picker.
- Highlighted machines show how many times they were added and how many sets they contain.

Previous step:

- Alert buttons now stack vertically so Russian button labels fit on phone screens.
- Added an app-level custom alert host matching Fridge's modal confirmation style.
- Replaced native delete confirmations with the custom app alert.
- Replaced workout exit confirmation with the custom app alert.
- Storage load/save errors now also use the same app alert.

Previous step:

- The workout screen back button now asks whether to save the workout.
- Android hardware back on the workout screen shows the same save confirmation.
- The confirmation offers cancel, do not save, and save actions.
- The finish button still saves immediately.

Previous step:

- Workouts are now the first tab and the default app tab.
- Removed the small add button from the Workouts toolbar.
- Added a large bottom `Start workout` button that floats above the workout list.
- The workout session primary action now says finish instead of save.

Previous step:

- Added local search for machines inside the workout session screen.
- The search matches machine name, muscle group, and note.
- Added a clear search button for the machine picker.

Previous step:

- Workout cards now show the workout date from `startedAt`.
- Workout search now includes the formatted workout date.

Previous step:

- Adding a machine to a workout now immediately creates the first empty set.
- Adding a new set now copies the previous set's weight and reps for the same exercise.
- New copied sets still start with an empty note.

Previous step:

- Replaced the simple workout note form with a workout session screen.
- The Workouts `+` button now starts a workout with a default date-based name.
- A workout session can add machines from the Machines list.
- Each selected machine can have separate set rows with weight, reps, and a note.
- Existing saved note-based workouts are migrated to the new local format with empty exercises.

Previous step:

- Added the first local workout types.
- Added AsyncStorage persistence for workouts.
- Added a workout list screen with search, add, edit, delete, and filtered-empty state.
- Added a workout form screen for creating and editing workouts.
- Added native delete confirmation before removing a workout.
- Kept workouts intentionally simple with only name and note fields for the current MVP.

Previous step:

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

Manually launch `Start Expo Go Tunnel.cmd`, scan the Expo QR code with Expo Go, and verify machine card tap-to-edit, machine deletion, workout card actions, leaving a newly started empty workout, leaving a repeated workout without edits, and opening an existing saved workout without edits.

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
- Machine IDs currently use a timestamp string, which is sufficient for this local personal MVP but can be replaced later if needed.
- Workout IDs currently use a timestamp string, which is sufficient for this local personal MVP but can be replaced later if needed.
- Workout set values are stored as strings for simple mobile input; validation and numeric summaries can be added later.
- `npm audit` reports moderate vulnerabilities from the generated Expo and tunnel dependency tree; no remediation was applied because automatic fixes could affect Expo SDK compatibility.
