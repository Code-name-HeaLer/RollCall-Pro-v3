import * as Sharing from 'expo-sharing';
import { getFullAttendanceReport } from '../db/db';

// FIX: Expo SDK 54 moved the old API to 'legacy'. 
// We use 'require' to load it dynamically and bypass TypeScript definition errors.
const FileSystem = require('expo-file-system/legacy');

export const exportAttendanceToCSV = async () => {
    try {
        // 1. Fetch Data
        const data = await getFullAttendanceReport();

        if (data.length === 0) {
            throw new Error("No attendance data to export.");
        }

        // 2. Define CSV Header
        let csvString = 'Date,Subject,Status,Type\n';

        // 3. Loop and Append Data
        data.forEach((row) => {
            // Escape commas in subject names to prevent CSV breakage
            const safeSubject = row.subject.includes(',') ? `"${row.subject}"` : row.subject;
            csvString += `${row.date},${safeSubject},${row.status},${row.type}\n`;
        });

        // 4. Create File Path
        // Use the Legacy FileSystem object
        const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
        const fileName = `RollCall_Report_${new Date().toISOString().split('T')[0]}.csv`;
        const filePath = directory + fileName;

        // 5. Write File
        // Using the legacy function from the required module
        await FileSystem.writeAsStringAsync(filePath, csvString, {
            encoding: 'utf8', // Use string directly
        });

        // 6. Share File
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filePath);
        } else {
            throw new Error("Sharing is not available on this device");
        }

    } catch (error: any) {
        console.error("Export Error:", error);
        throw error; // Re-throw to handle in UI
    }
};