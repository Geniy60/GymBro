# Project Status

## Current State

The project is now a minimal Expo SDK 54 / React Native / TypeScript mobile app for a personal gym assistant.

The app now uses the shared Supabase project used by the sibling Vacation app.

The initial app shell is in place with a compact header, safe-area handling, and two main tabs:

- Exercises
- Workouts

The Exercises tab supports list, search, add, edit, and delete. Exercise data still loads from the existing Supabase machine tables through a small service layer and TanStack Query. Exercise saves now go through one transactional Supabase RPC so exercise rows and muscle-group rows are updated atomically. The standard exercise catalog currently contains 32 items.

The Workouts tab starts and edits factual workout logs for the selected local phone user. A workout contains exercises selected from the Exercises list, and each exercise contains individually entered sets with weight, reps, and an optional set note. Workout data now loads from Supabase through a small service layer and TanStack Query. Workout saves now go through one transactional Supabase RPC so workout rows, exercises, and sets are updated atomically. Active workout drafts are autosaved locally on the phone and can be restored after app restart before they are saved to Supabase. The active workout screen has separate Save and Finish actions: Save persists without closing the workout, while Finish saves and returns to the workout list.

The active workout screen now has a rest timer button. The timer duration is stored locally on the phone, defaults to 90 seconds, can be changed from Settings, and schedules a local device notification through `expo-notifications` when started. Notification support is loaded lazily when the timer starts. Expo Go may still show its known `expo-notifications` limitation warning even though local timer notifications arrive.

Empty workout drafts now offer a quick exercise suggestion flow. From an empty workout, the user can choose target muscle groups and an exercise count, preview a randomized set of matching exercises, reshuffle it, and add the suggested exercises to the workout using the same latest-set prefill behavior as manual exercise selection.

Settings now include a body measurements screen. Measurements are stored in Supabase per selected user and support weight, waist, hips, chest, and abdomen values. Existing measurement history entries can be edited or deleted, and the screen includes a selectable SVG line chart that defaults to weight.

The app has a simple local user selector for the two seeded users:

- Женя
- Настя

The selected user is stored locally on the phone with AsyncStorage. Exercises stay shared; workouts are scoped by `user_id`.

User-facing app text is centralized in `src/strings.ts`.

New app-generated exercise, workout, workout-exercise, and set IDs are created through a shared UUID helper backed by `expo-crypto`.

The main header has a manual refresh action next to settings. It invalidates the TanStack Query cache and shows short spinner feedback, matching the sibling Fridge app pattern.

The project is now linked to EAS as `@geniy60/gymbro` and has an Android internal-distribution APK build profile named `apk`.

## Last Completed Step

Polished the shared search input.

Details:

- Added a search icon, icon-based clear action, and a calmer focused state to the shared `SearchInput`.
- Kept the existing search value, placeholder, text-change, and clear behavior unchanged.
- Left the separate stats overview search untouched for a future focused cleanup.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Polished the shared empty state.

Details:

- Restyled the shared `EmptyState` with a softer contained surface and a decorative neutral icon.
- Updated the reset action styling to match the refreshed green-accent button system.
- Kept existing empty-state titles, messages, reset behavior, and component props unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Polished the shared list loading skeleton.

Details:

- Restyled the shared `ListLoadingState` rows to look more like the refreshed list cards.
- Added a soft left placeholder, varied text placeholder widths, and a right action placeholder for a more intentional loading state.
- Kept the existing `rowCount` API and all screens that use the loading skeleton unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Adjusted the user selection screen alignment.

Details:

- Removed vertical centering from the user selection screen content after it made the first-run layout feel visually awkward.
- Kept the updated neutral background, refreshed user cards, image frames, selected state, and short-screen scrolling behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Polished the user selection visual layout.

Details:

- Changed the first-run user selection background from the older yellow tint to the app's calmer neutral background.
- Restyled the user selection cards, selected state, back button, title, and image frames to match the refreshed green-accent visual system.
- Added scrollable content for the user selection screen so the two user cards remain reachable on shorter screens.
- Kept user ordering, current-user selection, user images, save flow, and all selection behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Softened Nastya's app background.

Details:

- Changed Nastya's user-specific app background from a pink tint to a quieter cool neutral tint.
- Kept Zhenya's background, default background, user selection logic, and all screen behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Improved main tab responsiveness.

Details:

- Made main tab labels stay on one line with font scaling on narrow screens.
- Reduced tab gaps and horizontal padding slightly so the icon plus Russian label layout has more room.
- Kept tab icons, active-state styling, tab selection, settings navigation, and manual refresh behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Polished the app shell visual layout.

Details:

- Restyled the main app header with a stronger title and softer refresh/settings icon buttons.
- Reworked the main tabs into a calmer segmented control with icons and a single clear active state.
- Removed the older mixed pastel tab colors so the app shell matches the newer green-accent visual system.
- Kept tab selection, settings navigation, and manual refresh behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Polished the settings and rest timer settings visual layout.

Details:

- Restyled the Settings screen rows with softer cards, icon badges, stronger labels, and a refined change-user action.
- Restyled the Rest Timer settings screen as a compact form card with softer input and matching primary Save action.
- Kept settings navigation, user switching, rest timer duration loading, validation, and saving behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Polished the body measurements visual layout.

Details:

- Restyled the body measurement metric picker with softer selected and unselected states.
- Updated the measurement chart and empty chart containers to match the refreshed card surfaces.
- Made the body measurement input form more compact with a two-column field layout and softer inputs.
- Refined Save, cancel-edit, and measurement history card styling.
- Kept body measurement loading, validation, save, update, delete, chart calculations, and Supabase flow unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Polished the exercise form visual layout.

Details:

- Added a compact `Strength / Cardio` tracking-type selector to the exercise form, using the existing `trackingType` field already supported by the app and database.
- Restyled exercise form inputs with softer surfaces and stronger label hierarchy.
- Updated muscle-group chips to match the refreshed exercise tile palette.
- Refined Save and Delete action styling while keeping their behavior unchanged.
- Kept exercise validation, Supabase save flow, delete flow, and navigation behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Restored exercise tile image visibility.

Details:

- Removed the remaining custom background from the image area inside shared exercise tiles so exercise photos render like they did before the visual polish.
- Kept the overall exercise tile border, title, tracking-type badge, selection state, and press behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Removed exercise tile image frame border.

Details:

- Removed the subtle extra border around the image area inside shared exercise tiles.
- Kept the overall exercise tile border, image background, title, tracking-type badge, selection state, and press behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Reduced exercise tile title size.

Details:

- Reduced the shared exercise tile title font size by one point and adjusted line height so long Russian exercise names wrap less like a staircase.
- Kept the shared exercise tile layout, image, tracking-type badge, selection state, and press behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Simplified exercise tile metadata.

Details:

- Removed muscle group text from the shared exercise tile so the compact tracking-type badge no longer competes with a second metadata line.
- Kept muscle groups available in exercise search, editing, workout picker filtering, and stats filtering.
- Kept the shared exercise tile image, title, tracking-type badge, selection state, and press behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Polished the exercise catalog visual layout.

Details:

- Restyled the shared exercise tile with a softer surface, lighter image frame, stronger title rhythm, and compact tracking-type badge.
- Added centralized Russian labels for strength and cardio exercise tracking types.
- Updated the Exercises tab add button to use a proper icon while keeping the same action and placement.
- Softened the shared search input surface so the main list screens feel more consistent.
- Kept exercise loading, search, edit navigation, stats history navigation, workout picker selection, and suggestion flows unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Polished the workouts list visual layout.

Details:

- Restyled workout list cards with a softer border, subtle left accent, stronger title hierarchy, and calmer action buttons.
- Added the workout date and time to each workout card using the existing `startedAt` summary data.
- Restyled month dividers as compact soft badges so the list is easier to scan.
- Updated the Start Workout button with a matching icon and slightly stronger primary-action styling.
- Kept workout loading, search, edit, repeat, delete, pagination, and start-workout behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Polished the active workout visual layout.

Details:

- Made the workout name row feel more like a compact toolbar with a softer input surface and matching add-exercise action.
- Restyled the active workout bottom action area as a single contained control bar while keeping the existing Save, Finish, and rest timer behavior unchanged.
- Refined workout exercise cards with a softer border, subtle left accent, calmer collapsed state, and better long-title wrapping.
- Aligned set and cardio input surfaces with the refreshed card palette.
- Kept workout data entry, autosave, rest timer, collapse, delete, clear, and finish behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Polished the Stats overview visual layout.

Details:

- Made the total and monthly workout counters feel more like summary tiles with icons and softer accent styling.
- Restyled the last-six-month chart with a calmer track/bar treatment and a current-month accent.
- Removed the framed container around the stats exercise search/list area so the exercise cards no longer feel nested inside another card.
- Slightly enlarged and softened the stats exercise search input.
- Kept all stats data loading, search behavior, and exercise history navigation unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Removed the stats exercise history picker title.

Details:

- Removed the `Посмотреть историю упражнения` heading from the stats exercise history search section.
- Kept the search input, exercise cards, and history navigation behavior unchanged.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Submitted Android APK build version 5.

Details:

- Incremented Android `versionCode` from 4 to 5.
- Submitted EAS Android internal-distribution APK build with profile `apk` and `--no-wait`.
- Build URL: https://expo.dev/accounts/geniy60/projects/gymbro/builds/3e729962-a874-4256-a5e4-cf7e4c48a802
- Did not wait for the final cloud build result, per the APK build workflow.

Previous step:

Added a native Android exact alarm for the rest timer.

Details:

- Added a local Android-only Expo module `gymbro-rest-timer-alarm`.
- The module schedules the rest timer with `AlarmManager.setExactAndAllowWhileIdle()` and does not use `setAlarmClock()`, so it should not appear as an upcoming system alarm.
- Added a native `BroadcastReceiver` that shows the rest timer notification when the exact alarm fires.
- The React Native timer service now requests notification permission first, then uses the native Android alarm in APK builds, with the existing `expo-notifications` path as a fallback for Expo Go and non-Android platforms.
- Added the local module dependency and updated `package-lock.json`.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.
- Verified `npx.cmd expo-modules-autolinking search --platform android` finds `gymbro-rest-timer-alarm`.

Previous step:

Added the Android exact alarm install-time permission for the rest timer.

Details:

- Added `USE_EXACT_ALARM` alongside `SCHEDULE_EXACT_ALARM` in the Android app config so a personal APK can schedule exact rest timer alarms that wake the device while the screen is off.
- This complements the existing rest timer notification change that schedules by date on the high-priority rest timer notification channel.
- A new APK build and install is required before this native permission can affect phone behavior.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Improved rest timer notification reliability while the app is backgrounded.

Details:

- Changed the rest timer notification setup to create the Android notification channel before requesting notification permission.
- Moved rest timer notifications to a new high-priority Android channel with max importance, vibration, and public lock-screen visibility.
- Changed rest timer scheduling from a relative time interval trigger to a specific date trigger.
- Added the Android `SCHEDULE_EXACT_ALARM` permission to support exact timer delivery in a new APK build.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Updated stats exercise search cards.

Details:

- Replaced the plain stats exercise history search rows with the shared exercise tile card used elsewhere.
- Loaded muscle groups and notes for stats exercise history summaries so the cards can show the same group metadata and search can match names, groups, and notes.
- Kept the change scoped to the stats overview and existing shared card component.
- Verified `npx.cmd tsc --noEmit` passes.
- Verified `npm.cmd test` passes with 35 tests across 9 test files.

Previous step:

Submitted Android APK build version 4.

Details:

- Incremented Android `versionCode` from 3 to 4.
- Ran Expo Doctor only, as requested; 18/18 checks passed.
- Submitted EAS Android internal-distribution APK build with profile `apk` and `--no-wait`.
- Confirmed the latest EAS Android build is `IN_PROGRESS` with app build version `4`.
- Build URL: https://expo.dev/accounts/geniy60/projects/gymbro/builds/a8c5f428-3017-4a64-a5b3-8a5fc2e8d1c9

Previous step:

Aligned body measurement and exercise edit keyboard behavior with workouts.

Details:

- Removed the forced scroll-on-focus behavior from exercise editing and body measurements.
- Exercise editing now uses the same keyboard-height inset pattern without jumping the form on each focused field.
- Body measurements now shifts the list/form area above the keyboard without forcing repeated scrolls when switching fields.
- This keeps keyboard behavior consistent with the active workout screen.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Added auto-scroll for lower keyboard-covered form fields.

Details:

- Exercise add/edit now scrolls to the lower form area when the note field receives focus.
- Body measurements now scroll the form toward the focused measurement input.
- Starting measurement edit also scrolls back to the measurement form.
- This complements the Android keyboard bottom inset, which adds space but does not automatically move the focused input into view by itself.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Applied Android keyboard inset handling across input screens.

Details:

- Reused the existing `useKeyboardBottomInset` helper across all remaining screens with user input where the keyboard could cover content.
- Added keyboard-aware bottom padding to rest timer settings, body measurements, machines list search, workout exercise picker search, workouts list search, and stats history search.
- Added drag-to-dismiss keyboard behavior to the affected scrollable lists.
- Kept the existing active workout and exercise form keyboard handling.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.
- Verified `npx expo install --check` reports dependencies are up to date.

Previous step:

Changed the rest timer button accent color.

Details:

- Changed the active workout Rest button to use an orange accent.
- Kept Save and Finish button colors unchanged.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Adjusted active workout bottom button height.

Details:

- Increased the one-row bottom action button height from 38 to 44.
- This keeps the buttons smaller than the original 48 height while making them easier to tap.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Compacted active workout bottom controls into one row.

Details:

- Moved the rest timer action into the same row as Save and Finish.
- The active rest timer button now shows the countdown in place.
- Tapping the active rest timer button cancels the timer.
- Reduced bottom action button height from 48 to 38 to give the exercise list more space.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Replaced Android native keyboard resize with a JS keyboard inset.

Details:

- Removed Expo Android `softwareKeyboardLayoutMode: "resize"` because it does not help the current Expo Go session without a new native build.
- Added `src/useKeyboardBottomInset.ts` to track Android keyboard height through React Native keyboard events.
- The active workout bottom controls now move above the keyboard while keeping the exercise list scrollable in the remaining space.
- The exercise add/edit form gets extra bottom scroll padding while the Android keyboard is open.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.
- Verified `npx expo install --check` reports dependencies are up to date.

Previous step:

Fixed the lingering bottom gap after hiding the keyboard.

Details:

- Changed Android `KeyboardAvoidingView` behavior from manual `height` adjustment to platform/system resize.
- Added Expo Android `softwareKeyboardLayoutMode: "resize"`.
- Kept iOS `KeyboardAvoidingView` padding behavior unchanged.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.
- Verified `npx expo install --check` reports dependencies are up to date.

Previous step:

Moved active workout bottom actions out of the exercise list overlay.

Details:

- Removed absolute positioning from the rest timer control and workout Save/Finish footer.
- Added a normal bottom controls area at the bottom of the active workout screen.
- The exercise list now scrolls only in the remaining available space above the bottom controls.
- Reduced the exercise list bottom padding because the controls no longer overlay list content.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Improved keyboard handling on exercise input screens.

Details:

- Wrapped the exercise add/edit form in a platform `KeyboardAvoidingView`.
- Added drag-to-dismiss keyboard behavior to the exercise form scroll view.
- Wrapped the active workout screen in a platform `KeyboardAvoidingView` so lower set input fields are not covered by the keyboard.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Removed the Expo Go notification warning suppression attempt.

Details:

- Removed the temporary `console.warn` filter around dynamic `expo-notifications` import.
- Kept the normal lazy import because it avoids loading notification support before the timer is used.
- Rest timer local notifications still arrive in Expo Go, but Expo Go may continue showing its known `expo-notifications` limitation warning.
- Accepted that warning as an Expo Go limitation rather than adding another suppression workaround.
- Verified `npm test` passes with 35 tests across 9 test files.
- Verified `npx expo install --check` reports dependencies are up to date.

Previous step:

Extended body measurements and made notification loading lazy.

Details:

- Added chest and abdomen fields to body measurements.
- Added and applied `supabase/migrations/20260704123000_gymbro_body_measurements_chest_abdomen.sql`.
- Added edit and delete actions for measurement history rows.
- Measurement editing reuses the existing add form and keeps the original measurement date.
- Updated the body measurement chart metric picker to include chest and abdomen.
- Changed the rest timer notification service to load `expo-notifications` lazily only when starting or cancelling a scheduled timer notification.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.
- Verified `npx expo install --check` reports dependencies are up to date.

Previous step:

Added rest timer notifications and body measurements.

Details:

- Added `expo-notifications` and configured the Expo notifications plugin.
- Added a workout rest timer control that starts from the active workout screen and schedules a local device notification.
- Added a Settings screen entry for the rest timer duration, stored locally with a default of 90 seconds.
- Added `react-native-svg` for a lightweight body measurement chart.
- Added a Settings screen entry for body measurements with add form, metric picker, SVG line chart, and history list.
- Added and applied `supabase/migrations/20260704120000_gymbro_body_measurements.sql`.
- Added a Supabase service and typed table definitions for body measurements.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.
- Verified `npx expo install --check` reports dependencies are up to date.

Previous step:

Submitted Android APK build version 3.

Details:

- Incremented Android `versionCode` from 2 to 3.
- Ran Expo Doctor only, as requested; 18/18 checks passed.
- Submitted EAS Android internal-distribution APK build with profile `apk`.
- Confirmed the latest EAS Android build is `IN_QUEUE` with app build version `3`.
- Build URL: https://expo.dev/accounts/geniy60/projects/gymbro/builds/db9c49a4-7133-425b-a12a-f766942be8a5

Previous step:

Added the curtsy reverse lunge exercise.

Details:

- Added `standard-curtsy-reverse-lunge` / `Косые выпады назад` as a standard strength exercise.
- Added and applied `supabase/migrations/20260703223000_gymbro_add_curtsy_reverse_lunge.sql`.
- Generated a matching studio-style male exercise image.
- Saved the project asset as `assets/machines/curtsy-reverse-lunge.png`.
- Connected `standard-curtsy-reverse-lunge` to the new image in `src/machineImages.ts`.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Applied the approved stair climber image angle.

Details:

- Replaced `assets/machines/stair-climber.png` with the approved generated image.
- The final stair climber asset now shows a male athlete from a rear three-quarter angle facing the console.
- Kept the exercise data and image mapping unchanged.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Replaced the stair climber image with a generated app-style asset.

Details:

- Replaced the temporary photo-based `assets/machines/stair-climber.png`.
- Generated a matching studio-style stair climber image with a person using the machine.
- Saved the final project asset as a 512x512 PNG.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Added the stair climber cardio exercise.

Details:

- Added `standard-stair-climber` / `Лестница` as a standard cardio exercise.
- Added and applied `supabase/migrations/20260703221000_gymbro_add_stair_climber.sql`.
- Prepared the user-provided stair climber image as `assets/machines/stair-climber.png`.
- Connected `standard-stair-climber` to the new image in `src/machineImages.ts`.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Increased exercise photo area by another eight percent.

Details:

- Increased the shared exercise tile image area from 134 to 145.
- Increased the tile minimum height from 204 to 215 to keep layout stable.
- Kept image rendering without zoom, background, or frame border.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Removed exercise image zoom.

Details:

- Removed the shared machine image `transform` scale because it could crop exercise artwork.
- Kept the larger shared exercise tile image area.
- Kept the machine image frame borderless and without a background.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Fixed machine image rendering after removing the frame background.

Details:

- Replaced percent-based image enlargement with a `transform` scale in the shared machine image frame.
- Kept the image frame borderless and without a background.
- Kept the larger shared exercise tile image area unchanged.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Removed the exercise image frame background.

Details:

- Removed the machine image frame background color and border.
- Kept the larger shared exercise image size and internal image zoom unchanged.
- Kept the change scoped to the shared machine image frame.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Enlarged exercise images to fill more of the tile.

Details:

- Increased machine image preview height in shared exercise tiles from 118 to 134.
- Increased the tile minimum height proportionally so the larger preview has stable layout space.
- Added a small internal image zoom in the shared machine image frame so artwork uses more of the available photo area.
- Kept the change scoped to shared exercise image display used by the exercise list, workout picker, and suggestion preview.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Enlarged exercise images.

Details:

- Increased machine image preview height in shared exercise tiles from 104 to 118.
- Increased the tile minimum height proportionally so the larger preview has stable layout space.
- Kept the change scoped to the shared tile used by the exercise list, workout picker, and suggestion preview.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Renamed the elliptical exercise.

Details:

- Renamed `standard-elliptical` from `Эллиптический ход` to `Эллипсоид`.
- Updated `supabase/migrations/20260703133000_gymbro_add_elliptical.sql` for fresh setup.
- Added and applied `supabase/migrations/20260703134000_gymbro_rename_elliptical.sql` for the current database.
- Kept the cardio type, muscle groups, and image unchanged.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Added the elliptical cardio exercise.

Details:

- Added `standard-elliptical` / `Эллиптический ход` as a standard cardio exercise.
- Added and applied `supabase/migrations/20260703133000_gymbro_add_elliptical.sql`.
- Generated a matching 512x512 elliptical trainer image.
- Saved the project asset as `assets/machines/elliptical.png`.
- Connected `standard-elliptical` to the new image in `src/machineImages.ts`.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Compacted the top stats area.

Details:

- Reduced the height of the total/month workout stat tiles.
- Reduced the last-six-month chart height from 120 to 108.
- Tightened vertical spacing in the top stats area so the exercise history list has more room.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Made strength max loading lazy.

Details:

- Removed the strength max RPC from the initial Stats screen load.
- The Stats exercise history picker now loads only the exercise catalog plus workout counters and month chart data.
- Strength maximums are now computed locally from the lazily loaded exercise history after opening a specific strength exercise.
- Cardio history remains lazy and unchanged.
- Updated the stats service test to ensure the initial stats load does not call `gymbro_machine_maxes`.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Show all exercises in stats history picker.

Details:

- Changed the Stats exercise history picker to list every exercise from the exercise catalog.
- Exercises now appear even when they have no workout history yet.
- Strength exercises still show the max summary in detail only when a max exists.
- Cardio exercises still open directly to the history list and show the empty state when there is no history.
- Updated the stats service test to cover strength with history, strength without history, and cardio.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Reworked stats exercise history.

Details:

- Replaced separate cardio and strength maximum sections with one combined exercise history list.
- Renamed the stats history block to `Посмотреть историю упражнения`.
- Added exercise history search in the stats block.
- Simplified history list rows to show only the exercise name.
- Strength history detail now shows the exercise maximum and date at the top.
- Cardio history detail opens directly to the history list without a maximum summary.
- Added and applied `supabase/migrations/20260703123000_gymbro_cardio_history_summaries.sql`.
- Added `gymbro_cardio_history_summaries` for cardio exercises that have history.
- Updated unit tests for the combined strength/cardio history list.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 35 tests across 9 test files.

Previous step:

Added compact cardio stats.

Details:

- Added latest cardio summary to the Stats screen.
- The cardio summary shows only distance, elevation, and time for the latest cardio workout.
- Tapping the cardio summary opens cardio history with the same three values by date.
- Kept cardio separate from strength maximums; no cardio maximums were added.
- Added and applied `supabase/migrations/20260703120000_gymbro_cardio_stats.sql`.
- Added `gymbro_latest_cardio_summary` and `gymbro_cardio_history` RPC functions.
- Added a focused unit test for cardio history mapping.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 34 tests across 9 test files.

Previous step:

Compacted the treadmill workout card.

Details:

- Reworked the treadmill cardio input block into two compact rows.
- First row now shows treadmill setup values: speed and incline.
- Second row now shows result values: distance, elevation, and time.
- Reduced cardio input height, label size, and spacing so the treadmill card takes less vertical space.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 33 tests across 8 test files.

Previous step:

Applied the treadmill exercise image.

Details:

- Approved and applied the generated treadmill image.
- Saved the project asset as `assets/machines/treadmill.png`.
- Connected `standard-treadmill` to the new image in `src/machineImages.ts`.
- Resized the generated preview to the project's normal 512x512 machine image format.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 33 tests across 8 test files.

Previous step:

Added treadmill cardio tracking.

Details:

- Added `standard-treadmill` / `Беговая дорожка` as a standard cardio exercise.
- Added exercise `tracking_type` support for strength and cardio exercises.
- Added optional cardio workout fields for time, distance, incline, elevation, and speed.
- Kept treadmill entries to one cardio block instead of strength-style multiple sets.
- Updated workout save/load RPC handling for the new cardio fields.
- Added and applied `supabase/migrations/20260703110000_gymbro_add_treadmill_cardio.sql`.
- Updated tests for strength and cardio workout payloads.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 33 tests across 8 test files.

Previous step:

Renamed the Gravitron exercise to pull-ups.

Details:

- Renamed `standard-assisted-pull-up-dip` from `Гравитрон` to `Подтягивания` in the initial Supabase seed.
- Added and applied `supabase/migrations/20260703100000_gymbro_rename_gravitron_to_pullups.sql` for the current database.
- Kept the existing exercise description, muscle groups, and machine image unchanged.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 32 tests across 8 test files.

Previous step:

Submitted a new Android APK build.

Details:

- Incremented Android `versionCode` from 1 to 2 for the new APK.
- Verified `npx tsc --noEmit` passes.
- Verified `npm test` passes with 32 tests across 8 test files.
- Submitted the EAS Android APK build with profile `apk` and `--no-wait`.
- EAS build logs: https://expo.dev/accounts/geniy60/projects/gymbro/builds/f5b63b8f-3c86-49c2-8f6d-65ed538b35e8

Previous step:

Replaced the app icon artwork.

Details:

- Generated and approved a caricature-style icon showing two clasped muscular arms with visible biceps.
- Updated `assets/icon.png`, `assets/splash-icon.png`, `assets/android-icon-foreground.png`, `assets/android-icon-background.png`, `assets/android-icon-monochrome.png`, and `assets/favicon.png`.
- Added cache-busting `*-arms.png` icon assets and updated `app.json` to reference those new paths.
- Added explicit Expo splash config using `assets/splash-icon-arms.png`.
- Used the approved generated artwork rather than the earlier cropped movie-still attempt.
- Removed the temporary crop preview asset.
- Verified `npx tsc --noEmit` and `npm test` pass.

Previous step:

Improved workout reliability, validation, cache invalidation, and test coverage.

Details:

- Added `src/features/workouts/workoutSessionReducer.ts` for active workout draft state changes.
- Moved workout name updates, exercise add/delete, set add/delete/update, set clearing, note toggling, and exercise collapse toggling through the reducer.
- Added pre-save validation for set weight and reps input.
- Empty weight/reps fields remain allowed, but filled weight must be a number 0 or greater and filled reps must be a positive integer.
- Added centralized Russian validation messages for invalid workout inputs.
- Added shared query invalidation helpers in `src/queryClient.ts`.
- Replaced raw workout and machine invalidation arrays in `App.tsx` with the shared helpers.
- Added unit tests for active workout reducer actions.
- Added unit tests for AsyncStorage workout draft recovery, draft clearing, and selected-user storage.
- Expanded Supabase service tests to cover read mapping for workout summaries, workout detail, latest sets, previous maxes, and machines.
- Expanded query key tests to cover shared invalidation helpers.
- Current unit test count: 32 tests across 8 test files.
- Verified `npm test` passes.

Previous step:

Added the first real unit test coverage for core behavior.

Details:

- Added `vitest` as the unit test runner because it runs TypeScript tests with minimal setup.
- Changed `npm test` to run both `npm run typecheck` and `npm run test:unit`.
- Added `npm run typecheck` for the explicit TypeScript check.
- Added unit tests for app-level workout creation, workout repeat copying, and user background selection.
- Added unit tests for active workout helpers: exercise filtering, suggestion picking, set creation, history copying, add-set behavior, workout normalization, dirty checking, and exit confirmation.
- Added unit tests for workout and exercise RPC payload mapping.
- Added unit tests for shared TanStack Query keys.
- Current unit test count: 13 tests across 5 test files.
- Verified `npm test` passes.

Previous step:

Continued focused refactoring of large UI files.

Details:

- Split the workout suggestion screen into focused components for muscle-group selection, exercise count selection, and suggested exercise preview.
- Extracted reusable `src/components/SecondaryScreenHeader.tsx` for simple back-button screen headers.
- Reused the shared secondary header in the active workout screen, machine picker, machine suggestion screen, and exercise form.
- Split the exercise form muscle-group picker into `src/features/machines/MachineMuscleGroupPicker.tsx`.
- Split exercise form save/delete actions into `src/features/machines/MachineFormActions.tsx`.
- Moved app-level workout object creation and user background selection into `src/appModel.ts`.
- Reduced `MachineSuggestScreen.tsx` from about 350 lines to 135 lines.
- Reduced `MachineFormScreen.tsx` from about 321 lines to 185 lines.
- Reduced `App.tsx` from about 521 lines to 492 lines.
- Reduced `WorkoutSessionScreen.tsx` from about 594 lines to 566 lines.
- Verified `npx tsc --noEmit` passes.

Previous step:

Refactored the largest app files into smaller focused modules.

Details:

- Extracted the root app header into `src/components/AppHeader.tsx`.
- Extracted the root tab row into `src/components/MainTabs.tsx`.
- Extracted the workout machine picker into `src/features/workouts/MachinePickerScreen.tsx`.
- Moved active workout helper logic into `src/features/workouts/workoutSessionModel.ts`.
- Extracted set-row editing into `src/features/workouts/WorkoutSetInputRow.tsx`.
- Split workout statistics UI into `src/features/stats/StatsOverview.tsx` and `src/features/stats/MachineHistoryScreen.tsx`.
- Moved statistics Supabase calls into `src/services/workoutStatsService.ts`.
- Reduced `WorkoutSessionScreen.tsx` from about 759 lines to 594 lines.
- Reduced `App.tsx` from about 678 lines to 521 lines.
- Reduced `WorkoutExerciseCard.tsx` from about 390 lines to 210 lines.
- Reduced `StatsScreen.tsx` from about 371 lines to 96 lines.
- Reduced `workoutsService.ts` from about 391 lines to 253 lines.
- Verified `npx tsc --noEmit` passes.

Previous step:

Improved reliability and workout-screen maintainability.

Details:

- Added `expo-crypto` and a shared `src/createId.ts` UUID helper.
- Replaced local timestamp/random ID generation for app-created workouts, workout exercises, sets, and custom exercises.
- Kept randomized exercise suggestions unchanged because that logic is deliberate shuffling, not ID generation.
- Split the active workout footer into `src/features/workouts/WorkoutSessionFooter.tsx`.
- Split the workout exercise suggestion flow into `src/features/workouts/MachineSuggestScreen.tsx`.
- Reduced `WorkoutSessionScreen.tsx` from about 971 lines to 759 lines.
- Added a Fridge-style header refresh button next to settings with spinner feedback and TanStack Query invalidation.
- Verified `npx tsc --noEmit` and `npm test` pass.

Previous step:

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

When the EAS build finishes, download and install the APK on the phone to verify the updated launcher icon and startup assets.

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

- Workout set values are stored as strings for simple mobile input; validation and numeric summaries can be added later.
- Local AsyncStorage data is no longer used by the app. Existing phone-local data will not automatically appear in Supabase unless a migration/import step is added later.
- `npm audit` reports moderate vulnerabilities from the generated Expo and tunnel dependency tree; no remediation was applied because automatic fixes could affect Expo SDK compatibility.
