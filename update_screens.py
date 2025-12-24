#!/usr/bin/env python3
import os

# Update AddTaskScreen.tsx
with open('src/screens/Tasks/AddTaskScreen.tsx', 'r') as f:
    content = f.read()

modal_code = '''

            {/* Task Modal */}
            <CustomModal
                visible={taskModal.visible}
                type={taskModal.type}
                title={taskModal.type === 'warning' ? 'Missing Info' : 'Error'}
                message={taskModal.message}
                primaryButtonText="Got It"
                onPrimaryPress={() => setTaskModal({ ...taskModal, visible: false })}
            />'''

content = content.replace(
    '        </SafeAreaView>\n    );\n}',
    modal_code + '\n        </SafeAreaView>\n    );\n}'
)

with open('src/screens/Tasks/AddTaskScreen.tsx', 'w') as f:
    f.write(content)
print("✓ AddTaskScreen.tsx updated")

# Update CalendarScreen.tsx for Alert.alert calls
with open('src/screens/Calendar/CalendarScreen.tsx', 'r') as f:
    content = f.read()

# Add import if not present
if 'import CustomModal' not in content:
    content = content.replace(
        "import { SafeAreaView } from 'react-native-safe-area-context';",
        "import { SafeAreaView } from 'react-native-safe-area-context';\nimport CustomModal from '../../components/ui/CustomModal';"
    )

# Add state for modals before the existing state declarations
state_code = '''    const [calendarModal, setCalendarModal] = useState<{ visible: boolean; type: 'error' | 'warning'; title: string; message: string }>({
        visible: false,
        type: 'error',
        title: '',
        message: '',
    });
    '''

# Find where to insert - after the last useState declaration
lines = content.split('\n')
insert_idx = None
for i in range(len(lines) - 1, -1, -1):
    if 'useState' in lines[i]:
        insert_idx = i + 1
        break

if insert_idx:
    lines.insert(insert_idx, state_code)
    content = '\n'.join(lines)

# Replace Alert.alert calls
content = content.replace(
    'Alert.alert("Missing Info", "Please select a subject.");',
    'setCalendarModal({ visible: true, type: "warning", title: "Missing Info", message: "Please select a subject." });'
)

content = content.replace(
    'Alert.alert("Error", "Could not add extra class.");',
    'setCalendarModal({ visible: true, type: "error", title: "Error", message: "Could not add extra class." });'
)

# Add CustomModal component at the end before closing tag
if '</ScreenWrapper>' in content:
    modal_jsx = '''
            {/* Calendar Modal */}
            <CustomModal
                visible={calendarModal.visible}
                type={calendarModal.type}
                title={calendarModal.title}
                message={calendarModal.message}
                primaryButtonText="Ok"
                onPrimaryPress={() => setCalendarModal({ ...calendarModal, visible: false })}
            />
        </ScreenWrapper>'''
    
    content = content.replace('        </ScreenWrapper>', modal_jsx)

with open('src/screens/Calendar/CalendarScreen.tsx', 'w') as f:
    f.write(content)
print("✓ CalendarScreen.tsx updated")

# Update TimetableModalContent.tsx
with open('src/screens/Subjects/TimetableModalContent.tsx', 'r') as f:
    content = f.read()

if 'import CustomModal' not in content:
    content = content.replace(
        'import { SafeAreaView } from',
        'import CustomModal from \'../../components/ui/CustomModal\';\nimport { SafeAreaView } from'
    )

# Add state
state_code = '''    const [timetableModal, setTimetableModal] = useState<{ visible: boolean; type: 'error' | 'warning'; message: string }>({
        visible: false,
        type: 'error',
        message: '',
    });
    '''

lines = content.split('\n')
insert_idx = None
for i in range(len(lines)):
    if 'useState' in lines[i] and 'showTimePicker' in lines[i]:
        insert_idx = i + 1
        break

if not insert_idx:
    for i in range(len(lines)):
        if 'useState' in lines[i]:
            insert_idx = i + 1

if insert_idx:
    lines.insert(insert_idx, state_code)
    content = '\n'.join(lines)

# Replace Alert calls
content = content.replace(
    'Alert.alert("Missing Info", "Please select a subject.");',
    'setTimetableModal({ visible: true, type: "warning", message: "Please select a subject." });'
)

content = content.replace(
    'Alert.alert("Error", "Could not save class.");',
    'setTimetableModal({ visible: true, type: "error", message: "Could not save class." });'
)

# Add CustomModal before return closing tags if in a modal
if '</Modal>' in content:
    insert_before = '</SafeAreaView>'
    if insert_before in content:
        modal_code = '''
            {/* Timetable Modal */}
            <CustomModal
                visible={timetableModal.visible}
                type={timetableModal.type}
                title={timetableModal.type === 'warning' ? 'Missing Info' : 'Error'}
                message={timetableModal.message}
                primaryButtonText="Ok"
                onPrimaryPress={() => setTimetableModal({ ...timetableModal, visible: false })}
            />
        </SafeAreaView>'''
        
        content = content.replace('        </SafeAreaView>', modal_code)

with open('src/screens/Subjects/TimetableModalContent.tsx', 'w') as f:
    f.write(content)
print("✓ TimetableModalContent.tsx updated")

print("\nAll screens updated with custom modals!")
