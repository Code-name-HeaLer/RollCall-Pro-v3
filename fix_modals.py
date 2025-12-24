import os

# Update AddTaskScreen.tsx
with open('src/screens/Tasks/AddTaskScreen.tsx', 'r') as f:
    content = f.read()

if '<CustomModal' not in content:
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

    content = content.rstrip()
    content = content[:-4] + modal_code + '''
        </SafeAreaView>
    );
}
'''
    with open('src/screens/Tasks/AddTaskScreen.tsx', 'w') as f:
        f.write(content)
    print("✓ AddTaskScreen.tsx updated")
else:
    print("✓ AddTaskScreen.tsx already has CustomModal")

# Update CalendarScreen.tsx for Alert.alert calls
with open('src/screens/Calendar/CalendarScreen.tsx', 'r') as f:
    content = f.read()

# Add import if not present
if 'import CustomModal' not in content:
    content = content.replace(
        "import { SafeAreaView } from 'react-native-safe-area-context';",
        "import { SafeAreaView } from 'react-native-safe-area-context';\nimport CustomModal from '../../components/ui/CustomModal';"
    )
    print("✓ Added CustomModal import to CalendarScreen")

# Add state for modals if not present
if 'const [calendarModal' not in content:
    # Find the last useState and add our state after it
    import re
    last_useState = content.rfind('useState(')
    if last_useState > 0:
        # Find the end of this useState call
        end_of_useState = content.find(');', last_useState) + 2
        state_code = '''\n    const [calendarModal, setCalendarModal] = useState<{ visible: boolean; type: 'error' | 'warning'; title: string; message: string }>({
        visible: false,
        type: 'error',
        title: '',
        message: '',
    });'''
        content = content[:end_of_useState] + state_code + content[end_of_useState:]
        print("✓ Added calendarModal state to CalendarScreen")

# Replace Alert.alert calls
content = content.replace(
    'Alert.alert("Missing Info", "Please select a subject.");',
    'setCalendarModal({ visible: true, type: "warning", title: "Missing Info", message: "Please select a subject." });'
)
content = content.replace(
    'Alert.alert("Error", "Could not add extra class.");',
    'setCalendarModal({ visible: true, type: "error", title: "Error", message: "Could not add extra class." });'
)
print("✓ Replaced Alert.alert calls in CalendarScreen")

# Add CustomModal component at the end before closing tag if not already there
if '</ScreenWrapper>' in content and '<CustomModal' not in content.split('</ScreenWrapper>')[0][-500:]:
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
    print("✓ Added CustomModal component to CalendarScreen")

with open('src/screens/Calendar/CalendarScreen.tsx', 'w') as f:
    f.write(content)
print("✓ CalendarScreen.tsx saved")

# Update TimetableModalContent.tsx
with open('src/screens/Subjects/TimetableModalContent.tsx', 'r') as f:
    content = f.read()

if 'import CustomModal' not in content:
    content = content.replace(
        'import { SafeAreaView } from',
        'import CustomModal from \'../../components/ui/CustomModal\';\nimport { SafeAreaView } from'
    )
    print("✓ Added CustomModal import to TimetableModalContent")

# Add state if not present
if 'const [timetableModal' not in content:
    last_useState = content.rfind('useState(')
    if last_useState > 0:
        end_of_useState = content.find(');', last_useState) + 2
        state_code = '''\n    const [timetableModal, setTimetableModal] = useState<{ visible: boolean; type: 'error' | 'warning'; message: string }>({
        visible: false,
        type: 'error',
        message: '',
    });'''
        content = content[:end_of_useState] + state_code + content[end_of_useState:]
        print("✓ Added timetableModal state to TimetableModalContent")

# Replace Alert calls
content = content.replace(
    'Alert.alert("Missing Info", "Please select a subject.");',
    'setTimetableModal({ visible: true, type: "warning", message: "Please select a subject." });'
)
content = content.replace(
    'Alert.alert("Error", "Could not save class.");',
    'setTimetableModal({ visible: true, type: "error", message: "Could not save class." });'
)
print("✓ Replaced Alert.alert calls in TimetableModalContent")

# Add CustomModal before return closing tags if not already there
if '</SafeAreaView>' in content and '<CustomModal' not in content.split('</SafeAreaView>')[-2][-500:]:
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
    
    content = content.replace('        </SafeAreaView>', modal_code, 1)  # Replace only first occurrence
    print("✓ Added CustomModal component to TimetableModalContent")

with open('src/screens/Subjects/TimetableModalContent.tsx', 'w') as f:
    f.write(content)
print("✓ TimetableModalContent.tsx saved")

print("\n✅ All screens successfully updated with custom modals!")
