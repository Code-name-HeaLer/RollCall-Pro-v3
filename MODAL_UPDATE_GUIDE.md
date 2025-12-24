# Custom Modal UI Consistency Update - Implementation Guide

## ✅ COMPLETED

### 1. Created Reusable CustomModal Component

**File:** `src/components/ui/CustomModal.tsx`

A flexible, type-safe modal component supporting multiple modal types:

- **danger** - Red alert for destructive actions
- **warning** - Yellow/amber for validation warnings
- **error** - Red for error states
- **info** - Blue for informational messages
- **success** - Green for successful operations
- **confirm** - Blue for confirmation dialogs

Features:

- Dark mode support via `useColorScheme`
- Customizable button text
- Optional secondary button for two-action dialogs
- Consistent styling matching your delete modal design
- Shadow effects on danger modals

### 2. Updated Settings Screen

**File:** `src/screens/Settings/SettingsScreen.tsx`

Replaced native Alert.alert calls with custom modals:

- ✅ "Reset Complete" → Success modal
- ✅ "Export Failed" → Error modal
- ✅ "Coming Soon" (Import) → Info modal
- ✅ "Could not delete data" → Error modal

### 3. Updated Add Subject Screen

**File:** `src/screens/Subjects/AddSubjectScreen.tsx`

Added validation modals:

- ✅ "Hold up!" (Missing name) → Warning modal
- ✅ "Math Error" (Invalid counts) → Warning modal
- ✅ "Error" (Save failed) → Error modal
- ✅ "Error" (Delete failed) → Error modal

### 4. Updated Add Task Screen (Partially)

**File:** `src/screens/Tasks/AddTaskScreen.tsx`

- ✅ Added import for `CustomModal`
- ✅ Added modal state management
- ✅ Replaced Alert.alert handlers with setTaskModal calls
- ⏳ **MANUAL STEP NEEDED:** Add CustomModal JSX before closing SafeAreaView

```tsx
// Add this before </SafeAreaView>:
{
  /* Task Modal */
}
<CustomModal
  visible={taskModal.visible}
  type={taskModal.type}
  title={taskModal.type === 'warning' ? 'Missing Info' : 'Error'}
  message={taskModal.message}
  primaryButtonText="Got It"
  onPrimaryPress={() => setTaskModal({ ...taskModal, visible: false })}
/>;
```

## ⏳ REMAINING MANUAL UPDATES

### Calendar Screen

**File:** `src/screens/Calendar/CalendarScreen.tsx`

1. Add import:

```tsx
import CustomModal from '../../components/ui/CustomModal';
```

2. Add state (after existing useState declarations):

```tsx
const [calendarModal, setCalendarModal] = useState<{
  visible: boolean;
  type: 'error' | 'warning';
  title: string;
  message: string;
}>({
  visible: false,
  type: 'error',
  title: '',
  message: '',
});
```

3. Replace Alert.alert calls (line ~194):

```tsx
// OLD:
Alert.alert('Missing Info', 'Please select a subject.');
// NEW:
setCalendarModal({
  visible: true,
  type: 'warning',
  title: 'Missing Info',
  message: 'Please select a subject.',
});
```

```tsx
// OLD:
Alert.alert('Error', 'Could not add extra class.');
// NEW:
setCalendarModal({
  visible: true,
  type: 'error',
  title: 'Error',
  message: 'Could not add extra class.',
});
```

4. Add CustomModal JSX before `</ScreenWrapper>`:

```tsx
{
  /* Calendar Modal */
}
<CustomModal
  visible={calendarModal.visible}
  type={calendarModal.type}
  title={calendarModal.title}
  message={calendarModal.message}
  primaryButtonText="Ok"
  onPrimaryPress={() => setCalendarModal({ ...calendarModal, visible: false })}
/>;
```

### Timetable Modal Content

**File:** `src/screens/Subjects/TimetableModalContent.tsx`

1. Add import:

```tsx
import CustomModal from '../../components/ui/CustomModal';
```

2. Add state (after existing useState declarations):

```tsx
const [timetableModal, setTimetableModal] = useState<{
  visible: boolean;
  type: 'error' | 'warning';
  message: string;
}>({
  visible: false,
  type: 'error',
  message: '',
});
```

3. Replace Alert.alert calls:

```tsx
// OLD:
Alert.alert('Missing Info', 'Please select a subject.');
// NEW:
setTimetableModal({ visible: true, type: 'warning', message: 'Please select a subject.' });
```

```tsx
// OLD:
Alert.alert('Error', 'Could not save class.');
// NEW:
setTimetableModal({ visible: true, type: 'error', message: 'Could not save class.' });
```

4. Add CustomModal JSX before `</SafeAreaView>`:

```tsx
{
  /* Timetable Modal */
}
<CustomModal
  visible={timetableModal.visible}
  type={timetableModal.type}
  title={timetableModal.type === 'warning' ? 'Missing Info' : 'Error'}
  message={timetableModal.message}
  primaryButtonText="Ok"
  onPrimaryPress={() => setTimetableModal({ ...timetableModal, visible: false })}
/>;
```

## Design Benefits

✨ **UI Consistency:**

- All alert dialogs now follow the same visual design
- Matches your existing delete modal in SettingsScreen
- Dark mode support throughout
- Appropriate icon and color for each modal type

✨ **Better UX:**

- More engaging than native alerts
- Customizable buttons and text
- Type-safe with TypeScript
- Smooth animations with fade transition

✨ **Maintainability:**

- Single source of truth for modal styling
- Easy to extend with new modal types
- Centralized icon and color logic
- Reusable across the app

## Testing Checklist

- [ ] Create a new task and trigger validation error
- [ ] Export attendance data (success/error paths)
- [ ] Try to import data (coming soon modal)
- [ ] Delete all data from settings
- [ ] Add a subject and try saving without name
- [ ] Add extra class from calendar without selecting subject
- [ ] Add class to schedule without selecting subject

All modals should appear with consistent styling and animation!
