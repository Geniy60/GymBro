# Project Status

## Current State

The project is now a minimal Expo SDK 54 / React Native / TypeScript mobile app for a personal gym assistant.

The app now uses the shared Supabase project used by the sibling Vacation app.

The initial app shell is in place with a compact header, safe-area handling, and two main tabs:

- Machines
- Workouts

The Machines tab supports list, search, add, edit, and delete. Machine data now loads from Supabase through a small service layer and TanStack Query.

The Workouts tab starts and edits factual workout logs for the selected local phone user. A workout contains exercises selected from the Machines list, and each exercise contains individually entered sets with weight, reps, and an optional set note. Workout data now loads from Supabase through a small service layer and TanStack Query.

The app has a simple local user selector for the two seeded users:

- Женя
- Настя

The selected user is stored locally on the phone with AsyncStorage. Machines stay shared; workouts are scoped by `user_id`.

User-facing app text is centralized in `src/strings.ts`.

## Last Completed Step

Converted workout set weight storage to numeric.

Details:

- Added and applied `supabase/migrations/20260629120000_gymbro_weight_kg_numeric.sql`.
- `gymbro_workout_sets.weight_kg` is now nullable `numeric` in Supabase.
- Workout input state still uses strings for React Native `TextInput`, while save/load converts between string and numeric/null.
- Empty or invalid weight input is saved as `null`.
- TypeScript and test checks pass after the weight storage conversion.

Previous step:

Grouped workouts and confirmed exercise deletion.

Details:

- The workout list now shows month separators such as `Июнь 2026`.
- Workout ordering still follows the existing loaded `started_at desc` order.
- Deleting an exercise from an in-progress workout now requires confirmation.
- TypeScript and test checks pass after the grouping and confirmation update.

Previous step:

Adjusted workout exit confirmation rules.

Details:

- New empty workouts now close without a save confirmation.
- New workouts with at least one exercise still ask whether to save.
- Existing workouts still close silently when unchanged and ask when changed.
- TypeScript and test checks pass after the exit confirmation update.

Previous step:

Removed duplicate workout date from cards.

Details:

- Workout cards now show only the workout name, without the separate date line.
- Database loading still sorts workouts by `started_at desc`.
- Removed the now-unused unknown-date string.
- TypeScript and test checks pass after the card cleanup.

Previous step:

Updated default workout naming.

Details:

- New workouts now use a default name with weekday plus date, without the word `Workout`.
- Existing saved workout names are unchanged.
- TypeScript and test checks pass after the default naming update.

Previous step:

Applied shared search input across all search fields.

Details:

- Replaced the Machines tab search with the shared `SearchInput`.
- Replaced the Workouts tab search with the shared `SearchInput`.
- All current app search fields now use the same inline clear `×` behavior.
- TypeScript and test checks pass after applying the shared search component.

Previous step:

Made search clear icon an input overlay.

Details:

- Changed the shared search input clear `×` from a separate flex-row element to an absolute overlay inside the input field.
- Added right padding to the input text so typed text does not overlap the clear control.
- TypeScript and test checks pass after the search input visual fix.

Previous step:

Copied Fridge-style search input for workout machine picker.

Details:

- Added a small shared `SearchInput` component modeled on the sibling Fridge app.
- Replaced the workout machine picker search row with this Fridge-style input, including the inline clear `×`.
- Removed the now-unused workout picker search accessibility string.
- TypeScript and test checks pass after the copied search input update.

Previous step:

Aligned workout machine picker search height.

Details:

- Matched the workout machine picker search input height to the app's standard 44px search fields.
- Matched the picker clear button to the same 44px square size.
- TypeScript and test checks pass after the picker search alignment.

Previous step:

Compacted workout machine picker rows.

Details:

- Reduced machine picker row height and vertical padding in the workout machine selection view.
- Reduced the gap between picker rows.
- TypeScript and test checks pass after the picker density adjustment.

Previous step:

Aligned workout top controls and repeat icon.

Details:

- Kept the add-exercise button square and increased the workout name input height to match it.
- Changed the workout repeat card icon to `sync-outline` for a cleaner circular-arrow repeat symbol.
- TypeScript and test checks pass after the control alignment update.

Previous step:

Polished main spacing and workout action icons.

Details:

- Reduced the vertical gap between the `GymBro` header and the main tab menu.
- Restyled the workout add-exercise button to match the filled add-button style used in the Fridge project.
- Replaced the workout repeat card icon with a copy-style icon that better communicates creating a new workout from an existing one.
- TypeScript and test checks pass after the UI polish.

Previous step:

Compacted workout list and bottom actions.

Details:

- Removed exercise/set count metadata from workout list cards.
- Matched the `Start workout` button height and typography to the workout finish button.
- Reduced the bottom offset for both bottom action buttons and adjusted list padding.
- Removed the now-unused workout card metadata string.
- TypeScript and test checks pass after the workout list and button spacing changes.

Previous step:

Compacted workout top row and collapsed cards.

Details:

- Moved the add-machine action into the workout name row as a compact plus button.
- Collapsed exercise cards now show only the title/meta block and expand button; clear/delete stay available in expanded cards.
- Machine loading now sorts by name only.
- TypeScript and test checks pass after the layout and sorting change.

Previous step:

Removed workout name field label.

Details:

- Removed the visible `Название` label above the workout name input to save vertical space.
- Changed the workout name placeholder to `Введите название тренировки`.
- Removed the now-unused label style from the workout session screen.
- TypeScript and test checks pass after the input spacing cleanup.

Previous step:

Removed workout exercise list heading.

Details:

- Removed the `Упражнения` heading above the workout exercise list to save vertical space.
- Removed the now-unused heading style and string.
- TypeScript and test checks pass after the spacing cleanup.

Previous step:

Compacted collapsed exercise cards.

Details:

- Collapsed exercise cards now use smaller vertical padding.
- Collapsed exercise headers remove the extra bottom gap and keep content vertically centered.
- Expanded exercise cards are unchanged.
- TypeScript and test checks pass after the compact collapsed-card adjustment.

Previous step:

Collapsed previous exercises when adding a new one.

Details:

- Adding a new machine to a workout now collapses all existing exercise cards.
- The newly added exercise stays expanded for immediate set editing.
- TypeScript and test checks pass after the collapse behavior change.

Previous step:

Improved workout machine selection and set reset.

Details:

- Replaced the inline machine picker in the workout session with a local full-screen picker view.
- The picker uses a normal vertical list with search and returns to the workout after selecting a machine.
- Added an exercise-level action to clear all set values while keeping the current set count.
- TypeScript and test checks pass after the workout UI change.

Previous step:

Prefilled exercises from recent history.

Details:

- When adding a machine to a workout, the app now looks up the latest previous workout that used that machine.
- If previous sets exist, the new exercise copies those set values with fresh set IDs.
- If no history exists for the machine, the app still creates four empty sets.
- The lookup uses already loaded workout data and a memoized map, so selecting machines does not trigger network requests.
- TypeScript and test checks pass after the prefill change.

Previous step:

Changed default sets for newly added exercises.

Details:

- Adding a machine to a workout now creates four empty sets immediately.
- Repeat/copy behavior is unchanged and still copies the source workout sets.
- TypeScript and test checks pass after the default set count change.

Previous step:

Changed workout machine picker to a compact grid.

Details:

- Replaced the horizontal one-row machine picker in the workout session with a two-column vertical grid.
- Limited the picker height so added exercises still keep the main screen space.
- TypeScript and test checks pass after the picker layout change.

Previous step:

Improved main tab contrast.

Details:

- Made the main `Machines` and `Workouts` tab colors slightly stronger so they do not blend into the user-specific backgrounds.
- Added a light panel background and border behind the tab row for separation.
- TypeScript and test checks pass after the tab color adjustment.

Previous step:

Softened Nastya background color.

Details:

- Changed Nastya's app background from `#FFF1F7` to the calmer `#FFF7FA`.
- TypeScript and test checks pass after the palette adjustment.

Previous step:

Added user-specific soft backgrounds.

Details:

- The user selection screen now uses a very light yellow background.
- The app background switches by selected user: `Настя` gets a very light pink background, `Женя` gets a very light blue background.
- The soft user background is applied across the main screen, settings, machine form, and workout session.
- TypeScript and test checks pass after the background change.

Previous step:

Adjusted user selection card order.

Details:

- The user selection screen now displays `Настя` before `Женя` using a small local display order.
- The database user seed order was left unchanged.
- TypeScript and test checks pass after the ordering change.

Previous step:

Added user images to the user selection screen.

Details:

- Cropped the provided two-character image into separate user assets.
- Mapped the left character to `gymbro-user-nastya` and the right character to `gymbro-user-zhenya`.
- Updated the user selection screen to show image cards for each known user.
- TypeScript and test checks pass after the UI change.

Previous step:

Fixed selected-user persistence on Expo Go.

Details:

- Downgraded `@react-native-async-storage/async-storage` to the Expo SDK 54 compatible version using `expo install`.
- Verified Expo dependency compatibility with `npx expo install --check`.
- This should fix the phone-side failure when saving the selected user.
- TypeScript and test checks pass after the dependency fix.

Previous step:

Made selected-user selection more tolerant.

Details:

- Selecting a user now applies immediately and returns to the main screen before background workout refresh finishes.
- Local selected-user persistence errors now show a specific user-setting alert instead of the generic data-save alert.
- Data-load query errors are logged with the underlying query error object to make the next phone-side issue easier to diagnose.

Previous step:

Made selected-user startup loading tolerant.

Details:

- If the local selected-user setting cannot be read from AsyncStorage, the app now falls back to no selected user and shows the user selection flow.
- This avoids showing a data-load failure alert for a recoverable local phone setting issue.

Previous step:

Added local user selection and per-user workouts.

Details:

- Added `gymbro_users` table and seeded `Женя` and `Настя`.
- Added `gymbro_workouts.user_id`, backfilled existing workouts to `Женя`, and indexed workouts by user/date.
- Applied `supabase/migrations/20260626142000_gymbro_users.sql` to the shared Supabase database.
- Added local selected-user storage with AsyncStorage.
- Added a first-run user selection screen.
- Added a settings screen with a current-user row and change-user action.
- Workouts now load, save, delete, and repeat under the selected user.
- Machines remain shared across users.
- Verified the app anon client can read `gymbro_users` and `gymbro_workouts.user_id`.

Previous step:

Applied Supabase persistence.

Details:

- Added Supabase and TanStack Query dependencies.
- Added Expo public Supabase configuration copied from the sibling Vacation app.
- Added `gymbro_*` Supabase table types, client setup, query keys, and service modules for machines and workouts.
- Replaced AsyncStorage app wiring with Supabase service calls and query invalidation.
- Removed the old AsyncStorage dependency and local storage files.
- Added a Supabase migration runner and migration instructions.
- Added `supabase/migrations/20260626130000_gymbro_initial_schema.sql` with GymBro tables and standard machine seed data.
- Applied the migration to the shared Supabase database.
- Verified the app anon client can read `gymbro_machines`; the seeded standard machine count is 23.

Previous step:

Added one-time standard machine seed data.

Details:

- Added a built-in standard machine catalog with stable IDs, Russian movement-style names, muscle group tags, and notes that help identify the real gym machine.
- Standard machines are seeded into local storage once and then behave like normal editable/deletable machines.
- Added a dedicated seed flag so standard machines can be added once to existing installs without being restored after the user edits or deletes them.
- The seed avoids duplicates by stable ID and by matching existing machine names.
- Standard machine names and notes are centralized in `src/strings.ts`.

Previous step:

Replaced free-text machine muscle groups with standard tags.

Details:

- Added a typed standard muscle-group tag list for machines.
- Machine form now uses multi-select muscle group tags instead of a free-text muscle group input.
- Machine cards show selected muscle groups as a compact one-line tag summary.
- Machine search and workout machine search now include selected muscle group labels.
- Existing stored machines are migrated from the old `muscleGroup` string to the new `muscleGroups` tag array when possible.
- Legacy aliases such as old broad muscle group names are centralized with the other strings.

Previous step:

Simplified machine cards.

Details:

- Removed machine notes from machine list cards to make the cards shorter.
- Notes are still stored and editable in the machine form.

Previous step:

Polished compact set row layout.

Details:

- Made the set number a small bordered badge instead of loose text.
- Aligned set number, weight input, reps input, note action, and delete action to the same height.
- Reduced horizontal gaps between set row controls so the row reads as one cohesive input group.

Previous step:

Adjusted compact set input baseline.

Details:

- Kept bottom padding at zero and added a small top padding to visually center compact weight/reps input text on Android.

Previous step:

Fixed dense set input clipping regression.

Details:

- Removed the forced line height that caused compact weight/reps input text to clip again.
- Restored a safer input height while disabling extra font padding for better vertical balance.

Previous step:

Refined dense set input vertical alignment.

Details:

- Slightly reduced the compact weight/reps input height after fixing text clipping.
- Added explicit line height and vertical text centering so the input content sits more evenly inside the border.

Previous step:

Adjusted dense set input height.

Details:

- Increased the compact weight/reps input height so text is not clipped vertically.
- Removed vertical input padding to keep text centered while preserving a compact set row.

Previous step:

Adjusted dense set input widths.

Details:

- Increased the compact weight/reps input width so placeholders and entered values fit better.
- Reduced horizontal input padding to keep the set row compact.

Previous step:

Compressed active workout exercise entries.

Details:

- Reduced padding and spacing inside exercise cards.
- Reduced exercise header spacing and metadata size.
- Reduced set row gaps, set number width, input height, input width, and action button size.
- Reduced set note input height and the add-set button height.
- Reduced note and collapse icon sizes to fit the denser controls.

Previous step:

Compressed the active workout screen vertically.

Details:

- Reduced vertical spacing in the workout session header, name field, machine picker, and section headings.
- Made the workout name input and machine search input shorter.
- Changed the machine picker from wrapping rows to a single horizontal scrolling row so it does not consume exercise-list height.
- Kept the exercise list as the only vertical scrolling area and kept the finish button fixed.

Previous step:

Adjusted active workout scrolling.

Details:

- The workout session screen no longer scrolls as one full form.
- Only the exercise list scrolls during an active workout.
- The workout header, name field, and machine picker stay fixed above the exercise list.
- The finish button is fixed at the bottom over the exercise list and remains visible while scrolling.
- The exercise list has bottom padding so the last exercise is not hidden behind the finish button.

Previous step:

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

Manually launch `Start Expo Go Tunnel.cmd`, scan the Expo QR code with Expo Go, and verify first-run user selection, settings user switching, and separate workout lists for `Женя` and `Настя`.

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
- Use the shared Supabase project from Vacation for GymBro persistence.
- Use `Start Expo Go Tunnel.cmd` for phone testing through Expo Go when LAN discovery is unreliable.
- Use TanStack Query for server data loaded from Supabase.
- Use AsyncStorage only for local phone settings, currently selected user.

## Known Rough Edges

- Machine IDs currently use a timestamp string, which is sufficient for this local personal MVP but can be replaced later if needed.
- Workout IDs currently use a timestamp string, which is sufficient for this local personal MVP but can be replaced later if needed.
- Workout set values are stored as strings for simple mobile input; validation and numeric summaries can be added later.
- Local AsyncStorage data is no longer used by the app. Existing phone-local data will not automatically appear in Supabase unless a migration/import step is added later.
- `npm audit` reports moderate vulnerabilities from the generated Expo and tunnel dependency tree; no remediation was applied because automatic fixes could affect Expo SDK compatibility.
