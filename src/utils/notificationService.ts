import * as Notifications from 'expo-notifications';
import { getNotificationSettings, logNotification } from '../db/db';

// Configure how system notifications appear when app is open
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const scheduleSmartNotification = async (
    title: string,
    body: string,
    type: 'task' | 'class',
    triggerDate: Date
) => {
    try {
        // 1. Check Settings
        const settings = await getNotificationSettings();
        if (settings) {
            const isEnabled = type === 'task' ? settings.notify_tasks : settings.notify_classes;
            if (!isEnabled) {
                console.log(`Skipping ${type} notification (Disabled by user)`);
                return;
            }
        }

        // 2. Schedule System Notification
        // FIX: Using explicit type to satisfy SDK 52+ requirements
        if (triggerDate > new Date()) {
            await Notifications.scheduleNotificationAsync({
                content: { title, body },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: triggerDate,
                },
            });
        }

        // 3. Log to Database (The one that shows in Bell Icon)
        await logNotification(title, body, type, triggerDate.toISOString());

    } catch (e) {
        console.error("Notification Error:", e);
    }
};