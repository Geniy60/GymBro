# Project Status

## Current State

The project is now a minimal Expo SDK 54 / React Native / TypeScript mobile app for a personal gym assistant.

The app now uses the shared Supabase project used by the sibling Vacation app.

The initial app shell is in place with a compact header, safe-area handling, and two main tabs:

- Exercises
- Workouts

The Exercises tab supports list, search, add, edit, and delete. Exercise data still loads from the existing Supabase machine tables through a small service layer and TanStack Query. Exercise saves now go through one transactional Supabase RPC so exercise rows and muscle-group rows are updated atomically. The standard exercise catalog currently contains 28 items.

The Workouts tab starts and edits factual workout logs for the selected local phone user. A workout contains exercises selected from the Exercises list, and each exercise contains individually entered sets with weight, reps, and an optional set note. Workout data now loads from Supabase through a small service layer and TanStack Query. Workout saves now go through one transactional Supabase RPC so workout rows, exercises, and sets are updated atomically. Active workout drafts are autosaved locally on the phone and can be restored after app restart before they are saved to Supabase. The active workout screen has separate Save and Finish actions: Save persists without closing the workout, while Finish saves and returns to the workout list.

Empty workout drafts now offer a quick exercise suggestion flow. From an empty workout, the user can choose target muscle groups and an exercise count, preview a randomized set of matching exercises, reshuffle it, and add the suggested exercises to the workout using the same latest-set prefill behavior as manual exercise selection.

The app has a simple local user selector for the two seeded users:

- Женя
- Настя

The selected user is stored locally on the phone with AsyncStorage. Exercises stay shared; workouts are scoped by `user_id`.

User-facing app text is centralized in `src/strings.ts`.

The project is now linked to EAS as `@geniy60/gymbro` and has an Android internal-distribution APK build profile named `apk`.

## Last Completed Step

Added the standing calf raise exercise.

Details:

- Added `standard-standing-calf-raise` / `Подъем на икры стоя` to the standard catalog.
- Added and applied `supabase/migrations/20260702135000_gymbro_add_standing_calf_raise.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Generated `assets/machines/standing-calf-raise.png` as a 512x512 PNG based on the provided reference and matched to the existing clean machine-render style.
- Mapped the new asset in `src/machineImages.ts`.
- Verified the current Supabase database contains the new exercise.
- Verified `npx tsc --noEmit` and `npm test` pass.

Previous step:

Added a non-closing Save action to the active workout screen.

Details:

- Replaced the single active-workout bottom action with two side-by-side buttons: Save and Finish.
- Save writes the current workout through the existing save flow and keeps the workout screen open.
- Finish keeps the previous behavior: save and close the workout screen.
- After a successful non-closing Save, the current workout draft becomes the saved baseline so leaving the screen does not show an unnecessary unsaved-changes prompt until the next edit.
- Added a short saved status message after non-closing saves.
- Verified `npx tsc --noEmit` and `npm test` pass.

Previous step:

Added active workout draft recovery, save retry status, and transactional exercise saving.

Details:

- Added local active workout draft storage in `src/storage/workoutDraftStorage.ts`.
- Active workout edits are now autosaved locally after meaningful draft changes.
- On app startup or user selection, the app offers to restore a matching unfinished workout draft for the selected user.
- The active workout screen now shows an inline saving state and an inline retry state if saving fails.
- Discarding a workout draft clears the stored local draft.
- Successful workout saves clear the stored local draft.
- Added and applied `supabase/migrations/20260702113000_gymbro_save_machine_rpc.sql`.
- Added `public.gymbro_save_machine(jsonb)` so exercise saves update exercise rows and muscle-group rows inside one database transaction.
- Updated `src/services/machinesService.ts` to call the new RPC.
- Updated Supabase function typings in `src/databaseTypes.ts`.
- Verified `npx tsc --noEmit` and `npm test` pass.

Previous step:

Added transactional workout saving and split dense workout-session UI pieces.

Details:

- Added and applied `supabase/migrations/20260702110000_gymbro_save_workout_rpc.sql`.
- Added `public.gymbro_save_workout(jsonb, text)` so a workout save happens inside one database transaction instead of separate client-side upsert/delete/insert calls.
- Updated `src/services/workoutsService.ts` to call the new RPC with a normalized JSON payload.
- Updated Supabase function typings in `src/databaseTypes.ts`.
- Extracted active workout exercise cards, the empty workout suggestion prompt, and workout picker machine buttons from `WorkoutSessionScreen.tsx` into focused local components.
- Reduced `WorkoutSessionScreen.tsx` from about 1416 lines to about 971 lines without changing the visible workflow.
- Applied the migration to the project database.
- Verified `npx tsc --noEmit` and `npm test` pass.

Previous step:

Added safer padding to the app launcher icon.

Details:

- Reduced the dumbbell artwork inside the launcher icon canvas by about 20% while preserving the existing approved image style.
- Updated `assets/icon.png`, `assets/splash-icon.png`, `assets/android-icon-foreground.png`, and `assets/android-icon-monochrome.png`.
- The Android adaptive foreground dumbbell now has roughly 129 px left and 130 px right margin on the 512 px foreground canvas.
- The regular 1024 px icon now has roughly 257 px left and 260 px right margin around the detected dumbbell artwork.
- Verified Expo Doctor passes 18/18 checks.
- Verified `npx tsc --noEmit` and `npm test` pass.

Previous step:

Prepared the first Android APK build configuration.

Details:

- Added the Expo owner and Android application id `com.evgeniy.gymbro`.
- Added Android `versionCode` 1 for the first APK version.
- Added `eas.json` with an `apk` profile using internal distribution and Android `buildType: apk`, matching the sibling Fridge project pattern.
- Linked the project to EAS project id `0ea9c50c-1bca-409d-8b72-e43529475e2b`.
- Added `expo-font` as the Expo SDK 54 compatible direct dependency required by `@expo/vector-icons` for standalone builds.
- Added the `build:apk` npm script for submitting the Android APK build.
- Verified Expo Doctor passes 18/18 checks.
- Verified `npx tsc --noEmit` and `npm test` pass.

Previous step:

Added the downward pec fly exercise.

Details:

- Added `standard-downward-pec-fly` / `Сведение рук вниз` to the standard catalog.
- Added and applied `supabase/migrations/20260701145000_gymbro_add_downward_pec_fly.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Added `assets/machines/downward-pec-fly.png` as a 512x512 PNG and mapped it in `src/machineImages.ts`.
- TypeScript and test checks pass after adding the exercise.

Previous step:

Added the dumbbell lunges exercise.

Details:

- Added `standard-dumbbell-lunges` / `Выпады с гантелями` to the standard catalog.
- Added and applied `supabase/migrations/20260701144500_gymbro_add_dumbbell_lunges.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Added `assets/machines/dumbbell-lunges.png` as a 512x512 PNG and mapped it in `src/machineImages.ts`.
- TypeScript and test checks pass after adding the exercise.

Previous step:

Renamed visible machine wording to exercise wording.

Details:

- Updated Russian UI strings so the app now says exercise/exercises instead of machine/machines in tabs, search, empty states, forms, alerts, stats, workout picker, suggestion flow, and accessibility labels.
- Updated standard catalog notes that still used the old Russian machine wording.
- Added and applied `supabase/migrations/20260701144000_gymbro_rename_machine_wording_to_exercises.sql` so the current Supabase data matches the app wording.
- Kept internal `machine` identifiers, Supabase table names, and service names unchanged to avoid a broad non-user-facing refactor.
- Added a small Russian exercise-count label helper for the suggestion count accessibility text.
- TypeScript and test checks pass after the wording update.

Previous step:

Neutralized two machine image backgrounds.

Details:

- Updated `assets/machines/leg-press.png` so the background is neutral grey instead of blue-tinted.
- Updated `assets/machines/seated-leg-curl.png` so the background is neutral grey instead of blue-tinted.
- Kept both images at the existing 512x512 PNG asset format.
- TypeScript and test checks pass after replacing the image assets.

Previous step:

Added the Bulgarian split squat exercise.

Details:

- Added `standard-bulgarian-split-squat` / `Болгарские приседания` to the standard catalog.
- Added and applied `supabase/migrations/20260701143000_gymbro_add_bulgarian_split_squat.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Added `assets/machines/bulgarian-split-squat.png` as a 512x512 PNG and mapped it in `src/machineImages.ts`.
- TypeScript and test checks pass after adding the exercise.

Previous step:

Added the barbell Romanian deadlift exercise.

Details:

- Added `standard-barbell-romanian-deadlift` / `Румынская тяга` to the standard catalog.
- Added and applied `supabase/migrations/20260701142000_gymbro_add_barbell_romanian_deadlift.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Added `assets/machines/barbell-romanian-deadlift.png` as a 512x512 PNG and mapped it in `src/machineImages.ts`.
- TypeScript and test checks pass after adding the exercise.

Previous step:

Added the barbell hip thrust exercise.

Details:

- Added `standard-barbell-hip-thrust` / `Ягодичный мост со штангой` to the standard catalog.
- Added and applied `supabase/migrations/20260701140500_gymbro_add_barbell_hip_thrust.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Added `assets/machines/barbell-hip-thrust.png` as a 512x512 PNG and mapped it in `src/machineImages.ts`.
- TypeScript and test checks pass after adding the exercise.

Previous step:

Added the bent-arm pec deck exercise.

Details:

- Added `standard-bent-arm-pec-deck` / `Сведение рук с согнутыми локтями` to the standard catalog.
- Added and applied `supabase/migrations/20260701135000_gymbro_add_bent_arm_pec_deck.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Added `assets/machines/bent-arm-pec-deck.png` as a 512x512 PNG and mapped it in `src/machineImages.ts`.
- TypeScript and test checks pass after adding the exercise.

Previous step:

Added the incline chest press exercise.

Details:

- Added `standard-incline-chest-press` / `Жим от груди под наклоном` to the standard catalog.
- Added and applied `supabase/migrations/20260701125000_gymbro_add_incline_chest_press.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Updated `supabase/migrations/20260630170000_gymbro_remove_standard_machines.sql` so fresh setup no longer removes this re-added exercise.
- Added `assets/machines/incline-chest-press.png` as a 512x512 PNG and mapped it in `src/machineImages.ts`.
- TypeScript and test checks pass after adding the exercise.

Previous step:

Added the seated overhead triceps extension exercise.

Details:

- Added `standard-seated-overhead-triceps-extension` / `Разгибание рук из-за головы сидя` to the standard catalog.
- Added and applied `supabase/migrations/20260701123500_gymbro_add_seated_overhead_triceps_extension.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Added `assets/machines/seated-overhead-triceps-extension.png` as a 512x512 PNG and mapped it in `src/machineImages.ts`.
- TypeScript and test checks pass after adding the exercise.

Previous step:

Added the seated triceps press exercise.

Details:

- Added `standard-seated-triceps-press` / `Жим на трицепс сидя` to the standard catalog.
- Added and applied `supabase/migrations/20260701122500_gymbro_add_seated_triceps_press.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Added `assets/machines/seated-triceps-press.png` as a 512x512 PNG and mapped it in `src/machineImages.ts`.
- TypeScript and test checks pass after adding the exercise.

Previous step:

Added the cable triceps pushdown exercise.

Details:

- Added `standard-cable-triceps-pushdown` / `Разгибание рук на блоке` to the standard catalog.
- Added and applied `supabase/migrations/20260701121500_gymbro_add_cable_triceps_pushdown.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Added `assets/machines/cable-triceps-pushdown.png` as a 512x512 PNG and mapped it in `src/machineImages.ts`.
- TypeScript and test checks pass after adding the exercise.

Previous step:

Added the dumbbell biceps curl exercise.

Details:

- Added `standard-dumbbell-biceps-curl` / `Сгибание рук с гантелями` to the standard catalog.
- Added and applied `supabase/migrations/20260701112000_gymbro_add_dumbbell_biceps_curl.sql`.
- Updated the initial schema seed so fresh setup includes the exercise.
- Added `assets/machines/dumbbell-biceps-curl.png` as a 512x512 PNG and mapped it in `src/machineImages.ts`.
- TypeScript and test checks pass after adding the exercise.

Previous step:

Replaced the pec deck machine image.

Details:

- Replaced `assets/machines/pec-deck.png` with the approved corrected image.
- The image now shows a front-facing butterfly / pec deck machine in the open wide-arm position, matching the provided reference direction.
- Resized the generated source image to the existing 512x512 PNG asset format.

Previous step:

Replaced the lateral raise machine image.

Details:

- Replaced `assets/machines/lateral-raise.png` with the approved corrected image.
- The machine now follows the provided reference more closely, with separate forward-facing roller pads and lower handles.
- Resized the generated source image to the existing 512x512 PNG asset format.
- TypeScript and test checks pass after replacing the image asset.

Previous step:

Replaced the hip abduction machine image.

Details:

- Replaced `assets/machines/hip-abduction.png` with the approved corrected image.
- The person now sits with both legs inside the machine and the resistance pads only outside the thighs.
- Resized the generated source image to the existing 512x512 PNG asset format.
- TypeScript and test checks pass after replacing the image asset.

Previous step:

Added people to all standard machine images.

Details:

- Regenerated all 16 remaining standard machine reference images with a person using each machine.
- Kept the image files at 512x512 PNG under `assets/machines`.
- The person-in-machine composition makes exercise direction and machine realism easier to verify in the app tiles.
- Kept existing machine IDs and image mappings unchanged.
- Generated a temporary contact sheet for visual QA and removed it after review.
- TypeScript and test checks pass after replacing the image assets.

Previous step:

Redrew the glute kickback machine image.

Details:

- Generated a clearer reference image for `standard-glute-kickback`.
- Replaced `assets/machines/glute-kickback.png` with a 512x512 optimized PNG showing the torso support and rear kickback roller in the same exercise plane.
- Kept the existing machine ID and image mapping unchanged.
- TypeScript and test checks pass after replacing the image asset.

Previous step:

Removed the shoulder press standard machine.

Details:

- Removed `standard-shoulder-press` / shoulder press from the current Supabase catalog.
- Added and applied `supabase/migrations/20260630173000_gymbro_remove_shoulder_press.sql`.
- Removed the same machine from the initial schema seed.
- Removed its machine image mapping and unused PNG asset.
- Existing workout history remains readable because workout exercises keep machine name snapshots and deleted machine IDs are set to null.
- TypeScript and test checks pass after removing the machine.

Previous step:

Redrew the seated row machine image.

Details:

- Generated a clearer reference image for `standard-seated-row`.
- Replaced `assets/machines/seated-row.png` with the new 512x512 optimized PNG.
- Kept the existing machine ID and image mapping unchanged.
- TypeScript and test checks pass after replacing the image asset.

Previous step:

Removed selected standard machines.

Details:

- Removed these standard machines from the current Supabase catalog:
  - Incline chest press
  - Torso rotation
  - Machine pullover
  - Triceps extension
  - High row
  - Abdominal crunch
- Added and applied `supabase/migrations/20260630170000_gymbro_remove_standard_machines.sql`.
- Removed the same machines from the initial schema seed so fresh setup uses the reduced catalog.
- Removed their machine image mappings and unused PNG assets.
- Existing workout history remains readable because workout exercises keep machine name snapshots and deleted machine IDs are set to null.
- TypeScript and test checks pass after removing the machines.

Previous step:

Added quick machine suggestions for empty workouts.

Details:

- Added a `Pick machines` entry point that appears only when a workout has no exercises.
- Added a local machine suggestion screen inside the active workout flow.
- The suggestion screen lets the user choose muscle groups and a target machine count.
- Matching machines are selected from the existing machine list, excluding machines already in the draft workout.
- The preview can be reshuffled before adding machines to the workout.
- The suggestion preview now uses the same machine image tile style as the machine catalog and workout picker.
- The top suggestion button now changes from `Pick` to `Pick again` after the first preview, and the preview action uses a single `To workout!` button.
- Increased the `To workout!` button label size for better emphasis.
- Styled the suggestion button with a purple-pink gradient using `expo-linear-gradient` to make the smart-pick action feel distinct.
- Applied the same gradient style to the empty-workout `Pick machines` entry button.
- Adding suggested machines reuses the existing latest-set prefill behavior used by manual machine selection.
- TypeScript and test checks pass after adding quick machine suggestions.

Previous step:

Generated standard machine reference images.

Details:

- Generated and added reference images for all 23 standard machines.
- Resized each machine image to 512x512 and optimized the PNG files for app use.
- Updated `machineImages.ts` so every standard `standard-*` machine now has an image.
- Custom/user-created machines still use the framed `Нет изображения` placeholder.
- TypeScript and test checks pass after adding the full standard machine image set.

Previous step:

Matched workout machine picker tile content.

Details:

- Removed the `1x / set count` metadata from workout machine picker tiles.
- Workout machine picker tiles now show the same muscle-group metadata as the Machines tab tiles.
- Selected picker tiles keep only their selected tile background/border; text content stays identical.
- Removed the now-unused workout selected-machine metadata string.
- TypeScript and test checks pass after matching tile content.

Previous step:

Shared machine tile component across machine lists.

Details:

- Extracted the machine image tile into a shared `MachineTile` component.
- The Machines tab and workout machine picker now use the same tile UI.
- Removed the old machine-specific card component.
- Preserved the selected state in the workout picker through the shared tile.
- TypeScript and test checks pass after sharing the machine tile.

Previous step:

Moved machine deletion into the edit screen.

Details:

- Removed the delete action from machine tiles.
- Added a destructive delete button inside the machine edit screen for existing machines only.
- Deleting the currently open machine now returns to the main screen after the confirmed delete completes.
- TypeScript and test checks pass after moving machine deletion.

Previous step:

Changed machine lists to image tiles.

Details:

- Added a shared `MachineImageFrame` component that shows a machine image or a framed `Нет изображения` placeholder.
- Converted the Machines tab from full-width rows to a two-column tile grid.
- Converted the workout machine picker to the same two-column image tile style.
- Kept existing machine edit/delete and picker behavior unchanged.
- TypeScript and test checks pass after the machine tile layout update.

Previous step:

Enlarged machine reference thumbnails.

Details:

- Increased machine reference images in machine cards from 48x48 to 72x72.
- Increased machine reference images in the workout machine picker from 42x42 to 64x64.
- Allowed the affected rows to grow taller so the generated Gravitron image is easier to recognize.
- TypeScript and test checks pass after the thumbnail sizing update.

Previous step:

Added first machine reference image.

Details:

- Generated a reference image for the standard assisted pull-up/dip machine (`standard-assisted-pull-up-dip` / Gravitron).
- Added the image under `assets/machines/assisted-pull-up-dip.png`.
- Added a small local `machineImages` mapping for machine-specific assets.
- Machine cards and the workout machine picker now show the image when a machine has one.
- TypeScript and test checks pass after the machine image test.

Previous step:

Polished active workout card styling.

Details:

- Refined active workout exercise cards with tighter spacing and clearer visual hierarchy.
- Turned exercise set counts into compact green metadata pills.
- Made set rows feel more cohesive with calmer inputs, action buttons, and record styling.
- Kept workout behavior unchanged; this was a visual polish pass only.
- TypeScript and test checks pass after the workout session styling update.

Previous step:

Added polished loading states.

Details:

- Added a shared `ListLoadingState` component with a compact activity indicator and stable skeleton rows.
- Workouts, Machines, Stats, and machine history now show calm loading states instead of blank or misleading empty views.
- Added centralized Russian loading messages.
- TypeScript and test checks pass after the loading-state polish.

Previous step:

Generated dumbbell app icon assets.

Details:

- Replaced the Expo app icon assets with a generated centered dumbbell icon.
- Kept generous safe-area padding so the dumbbell fits inside circular and squircle phone masks without cropping.
- Updated the Android adaptive icon foreground/background and a clean monochrome dumbbell silhouette.
- Updated favicon and splash icon from the same generated source.
- TypeScript and test checks pass after the icon asset update.

Previous step:

Simplified machine history rows.

Details:

- Removed the set-count line from machine history rows in the Statistics tab.
- Kept each history row focused on workout date and max weight.
- Removed the now-unused history set-count string.
- TypeScript and test checks pass after the history row simplification.

Previous step:

Debounced workout search empty state.

Details:

- Added a short debounce before sending workout search text to the server.
- Kept the search input responsive while avoiding empty-state flicker between typed characters.
- TypeScript and test checks pass after the search flicker fix.

Previous step:

Added persistent local migration credentials.

Details:

- Added the shared Supabase database connection string to local `.env.local`, which is ignored by git.
- Updated the migration runner to read `.env.local` and `.env` automatically.
- Added `npm run db:apply:latest` for applying the newest migration without passing a filename.
- Updated `SUPABASE_MIGRATIONS.md` with the local migration workflow.

Previous step:

Refactored workout loading for paged history.

Details:

- Added paged workout summary loading through TanStack Query infinite queries.
- The Workouts tab now loads summaries page by page and fetches more on scroll.
- Opening or repeating a workout now loads that workout's full exercises and sets only when needed.
- Stats no longer depend on the loaded workout list; totals, month counts, machine maxes, and machine history now use separate Supabase queries/RPC functions.
- The active workout screen no longer receives all previous workouts; it now loads latest sets for a selected machine and previous machine maxes through targeted queries.
- Added `supabase/migrations/20260630103000_gymbro_paged_workout_queries.sql` with the required read-only SQL functions.
- TypeScript and test checks pass after the workout data loading refactor.

Previous step:

Applied paged workout query migration.

Details:

- Applied `supabase/migrations/20260630103000_gymbro_paged_workout_queries.sql` to the shared Supabase database.
- Verified the new `gymbro_*` SQL functions exist in the public schema.
- TypeScript and test checks pass after applying the migration.

Previous step:

Compacted stats summary tiles.

Details:

- Reduced the height of the top Statistics summary tiles.
- Lowered summary tile padding and value font size so the machine max list has more vertical space.
- TypeScript and test checks pass after the stats density adjustment.

Previous step:

Reserved a stable record badge slot.

Details:

- Set rows now always reserve a 38x38 slot for the record trophy badge.
- Rows without a record keep the slot invisible, so note/delete/record columns no longer shift between sets.
- TypeScript and test checks pass after the stable record slot adjustment.

Previous step:

Right-aligned set row actions.

Details:

- Grouped set note/delete/record controls into a right-aligned action row.
- The set action gap now matches the exercise header action gap while the group aligns to the card's right edge.
- TypeScript and test checks pass after the set action alignment update.

Previous step:

Aligned set-row control spacing.

Details:

- Matched the set-row control gap to the exercise header action gap.
- Slightly narrowed the weight/reps inputs so the full set row fits with the 38x38 record trophy badge.
- TypeScript and test checks pass after the set-row spacing adjustment.

Previous step:

Matched record trophy badge size.

Details:

- Changed the workout record trophy badge to the same 38x38 size as the other set-row controls.
- TypeScript and test checks pass after the record badge sizing adjustment.

Previous step:

Fixed record badge layout and stats detail back behavior.

Details:

- Replaced the text `Рекорд` badge in workout set rows with a compact trophy icon badge.
- Added Android hardware back handling for the Statistics machine history detail view.
- TypeScript and test checks pass after the record badge and back behavior fix.

Previous step:

Added workout records and machine history.

Details:

- Workout set rows now show a `Рекорд` badge when the entered weight is greater than the previous max for that machine.
- Record checks compare only against previous workouts, excluding the currently edited workout.
- The Statistics max list now opens a local machine history detail view on tap.
- Machine history shows each matching workout date, set count, and max weight for that workout.
- TypeScript and test checks pass after the record and history update.

Previous step:

Adjusted main tab order.

Details:

- Main tabs now appear as Workouts, Stats, Machines.
- The default active tab remains Workouts.
- TypeScript and test checks pass after the tab order update.

Previous step:

Added statistics tab.

Details:

- Added a center `Stats` tab between Machines and Workouts.
- Added `StatsScreen` with all-time workout count, current-month workout count, a six-month workout count bar chart, and per-machine max weights.
- Statistics are computed locally from already loaded workouts for the selected user.
- Max weights ignore empty/non-numeric values and keep the latest date when the same max appears multiple times.
- TypeScript and test checks pass after the statistics feature.

Previous step:

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

When ready to check the icon on the phone, increment Android `versionCode`, submit a new EAS Android APK build, wait for it to finish, then install the APK for manual verification.

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
