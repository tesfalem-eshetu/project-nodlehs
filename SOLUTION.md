# SOLUTION

## Architectural Decisions

### Project Structure

The app is organized under `src/` with clear boundaries between layers:

- `types/` defines all data shapes using TypeScript interfaces and string enums (`DeviceStatus`, `ServiceRequestStatus`, `Priority`, `Category`). String enums were chosen over numeric ones because they are human-readable in Redux DevTools and serializable without mapping.
- `api/` contains the simulated backend. Each service (`deviceService.ts`, `serviceRequestService.ts`) manages its own in-memory data array and exposes Promise-based functions with a configurable delay (`utils.ts`). This mirrors how a real API client would work, so swapping in actual HTTP calls would only require changing these files.
- `store/` is split into `slices/`, `thunks/`, and `selectors/`. Slices own the state shape. Thunks handle async orchestration. Selectors derive computed data. None of them know about React or UI.
- `hooks/` sit between the store and the screens. Each hook composes selectors and dispatch calls into a single return value that a screen can consume without importing Redux directly. This keeps screens focused on rendering.
- `components/` holds reusable UI pieces (`DeviceListItem`, `ServiceRequestListItem`, `StatusIndicator`, `PriorityIndicator`, `ActivityLogEntry`) that are used across multiple screens.
- `app/` uses Expo Router's file-based routing with a tab layout for the Equipment List and Dashboard, and stack screens for Device Detail, Create Service Request, and Service Request Detail.

### State Shape

Redux state is normalized into two slices:

```
{
  devices: {
    items: Record<string, Device>,
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
  },
  serviceRequests: {
    items: Record<string, ServiceRequest>,
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
  }
}
```

Using `Record<string, T>` instead of arrays gives O(1) lookups by ID, which matters when multiple screens reference the same entity (e.g., a service request detail screen reading a single item while the dashboard counts all items by status).

### Async Handling

All data mutations go through `createAsyncThunk`. The simulated API layer uses `setTimeout` with a 300ms delay to mimic network latency. Each thunk returns the server's authoritative response, which the slice uses to update state on `fulfilled`.

Status updates and note additions use optimistic updates: the slice applies the expected change on the `pending` action (using `action.meta.arg`) and stores a snapshot of the previous state in a `_rollback` map. On `fulfilled`, the server response replaces the optimistic data. On `rejected`, the snapshot is restored. This makes the app feel responsive even with simulated delays.

The `updateServiceRequestStatus` thunk also handles an atomic operation: when a request is marked as completed, it updates both the service request status and the device's `lastMaintenanceDate` in a single thunk, ensuring both pieces of state stay consistent.

### Derived Data

Computed values like open request counts, overdue requests, and status/priority breakdowns are derived using `createSelector` from Redux Toolkit. These selectors are memoized, so they only recompute when the underlying `items` record changes. For example, `selectOpenRequestCountsMap` iterates all service requests once to build a `Record<string, number>` mapping device IDs to their open request counts, and this result is cached until the service requests slice changes.

### UI Library

React Native Paper was chosen for its built-in Material Design 3 theming system, which made it straightforward to implement light/dark mode support with a single theme object. The app's visual identity uses a custom color palette mapped to Paper's semantic color tokens.

## Trade-offs

- The simulated API is in-memory. Data does not persist across app restarts. In a real app, this layer would be backed by a REST API or local persistence with AsyncStorage/SQLite.
- No pagination on list screens. The seed data is small enough that this is not a problem, but a production app with hundreds of devices or requests would need windowed loading.
- The API layer enforces valid status transitions (e.g., you cannot go from `open` directly to `completed`), but there is no authentication or authorization. Any user can update any request.
- Pull-to-refresh re-fetches from the same in-memory data, so it has no visible effect in the current setup. It is implemented correctly and would become meaningful with a real backend.

## What I Would Improve With More Time

- User sessions and role-based access. A regular user would create and view service requests, while an admin/staff side would handle request assignments, status updates, and resolution workflows separately. This better reflects how maintenance operations work in practice -- the person reporting an issue is not the same person resolving it.
- Persistent storage so data survives app restarts.
- Accessibility roles and labels across all interactive elements, ensuring the app works well with screen readers and assistive technology.
- More granular animations on list item insertions and status badge color transitions.
- Push notifications or in-app alerts for overdue requests.
- Pagination or infinite scroll for the equipment list and maintenance timeline.


## Testing

The project includes 116 unit tests across 12 test suites, covering both core state logic and UI components:

- **Redux selectors** (26 tests): Every selector is tested, including filtered queries (`selectRequestsByDeviceId`, `selectOverdueRequests`), aggregations (`selectCountsByStatus`, `selectCountsByPriority`, `selectOpenRequestCountsMap`), and edge cases like empty state and missing IDs.
- **Redux thunks** (13 tests): Each thunk is tested with the API layer fully mocked. Tests verify the loading lifecycle (pending/fulfilled/rejected), correct dispatch behavior, and cross-slice coordination (e.g., `updateServiceRequestStatus` with Completed triggers a device `lastMaintenanceDate` update).
- **Slice reducers** (38 tests): Reducers are driven directly with raw action objects to test every branch of the optimistic update and rollback logic in isolation -- including edge cases like non-existent IDs, missing rollback data, and the difference between Completed and non-Completed status transitions on the devices slice.
- **UI components** (29 tests): All five reusable components (`StatusIndicator`, `PriorityIndicator`, `DeviceListItem`, `ServiceRequestListItem`, `ActivityLogEntry`) are rendered with React Native Testing Library and verified for correct label mapping, conditional rendering, date formatting, and press interactions.
- **Form validation** (10 tests): The Create Service Request screen is tested end-to-end for required field validation, whitespace handling, real-time error clearing, successful dispatch with navigation, and form-level error display on failure.

Run with: `npm test`

## Additional Libraries

| Library | Why |
|---------|-----|
| `react-native-paper` | Material Design 3 components and theming. Provides consistent, accessible UI primitives out of the box. |
| `@react-native-community/datetimepicker` | Native date picker for iOS and Android. No good cross-platform alternative exists in the Expo ecosystem. |
| `react-native-get-random-values` | Polyfill for `crypto.getRandomValues()` required by `uuid` v13 in the React Native Hermes runtime. Without it, ID generation fails at runtime. |
| `react-native-safe-area-context` | Provides safe area insets for handling notches and home indicators. Used on screens without a navigation header. |
| `uuid` | Generates unique IDs for service requests, activity log entries, and notes in the simulated API layer. |
| `jest-expo` | Jest preset configured for Expo projects. Handles module resolution, transforms, and React Native compatibility out of the box. |
| `@testing-library/react-native` | Renders components in a test environment and provides queries that mirror how users interact with the UI (by text, role, display value). |

## AI Tool Usage

I used Claude (via Cursor) throughout this project, and it was a genuine accelerator. From the start, it served as a thinking partner -- brainstorming the architecture, stress-testing ideas, and helping me assess trade-offs before writing a single line of code. I have experience with React Native and Context API for state management, but Redux Toolkit was new to me. Claude helped me learn the patterns (slices, thunks, selectors, normalized state) and understand the reasoning behind them, which meant I could make informed decisions rather than just copying boilerplate.

Where AI really shined was in execution speed. Claude handled a significant portion of the code writing, which allowed me to implement features like optimistic updates, pull-to-refresh, custom hooks, and a full theming system in a fraction of the time it would have taken manually. The workflow was iterative and fast -- I would describe what I wanted, review the output, give feedback on design and behavior, and guide the next iteration. This tight feedback loop let me focus on product thinking and UX decisions while the implementation kept pace.

Debugging was also collaborative. A good example: every mutation (create service request, update status, add note) was failing silently at runtime. Tracing through the logs revealed that `uuid` v13 calls `crypto.getRandomValues()` internally, but the React Native Hermes engine does not expose it on the global scope. ID generation was throwing before the API call even ran. The fix was installing `react-native-get-random-values` as a polyfill and importing it as the very first line in the app entry point, before any other module loads. Without Claude helping trace that through the logs, that could have been a multi-hour detour.

The result is a project that reflects my vision, priorities, and product instincts, built at a pace that AI tooling made possible. I see leveraging AI effectively as a core part of how modern software is built, and this project is a deliberate example of that approach.

## Running the App

```bash
npm install
npx expo start
```

The app runs on iOS Simulator, Android Emulator, or a physical device via Expo Go.
