# Local Notifications & Reminders Guide: React Native & Expo SDK 54

> **A comprehensive educational guide explaining how scheduled local reminders and alarms work in React Native, why we designed it this way, and how you can implement this feature in any mobile project.**

---

## 1. Executive Summary: What We Built

In **LockedIn**, when a user creates an event (e.g. *"At 1:00 PM I will study React Native"*), they can now set a **Reminder Notification**:
- 🔔 **At Event Time** (0 minutes before)
- 🔔 **5 minutes before**
- 🔔 **15 minutes before**
- 🔔 **30 minutes before**
- 🔕 **No Reminder**

### What happens behind the scenes:
1. **Permission Check & Setup**: When the app starts up, it requests notification permissions and configures an **Android Notification Channel** with high priority (heads-up banner and sound) and tells iOS/Android to present alerts even if the user is currently inside the app.
2. **Scheduled Trigger**: When an event is saved, `expo-notifications` registers a scheduled alarm with the device's native operating system (Android AlarmManager / iOS UNUserNotificationCenter) and returns a unique `notificationId`.
3. **Firestore Sync**: The `notificationId` and `reminderOffsetMinutes` are saved inside the Firestore document alongside the event.
4. **Lifecycle Cleanup**:
   - When the user marks the event as **Completed**, the scheduled notification is automatically **cancelled** (no annoying alert for completed tasks!).
   - When the user **Deletes** the event, the notification is automatically **cancelled**.
5. **UI Indicators**:
   - In `CreateEventModal.tsx`, user selects reminder offsets with sleek interactive chips.
   - In `EventCard.tsx`, a badge displays `🔔 5m before` or `🔔 At event time`.

---

## 2. Core Concepts: Local vs. Push Notifications

Many developers confuse **Local Notifications** with **Push Notifications**. Understanding the difference is crucial:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ PUSH NOTIFICATIONS (Remote)                                                 │
│                                                                             │
│ [Backend Server] ──(Payload)──> [Apple APNs / Google FCM] ──> [User Phone]  │
│                                                                             │
│ • Requires internet connection on the user's phone                          │
│ • Requires backend servers, API keys, FCM setup, and Apple Developer certs  │
│ • Best for: Chat messages, social media likes, breaking news, marketing     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ LOCAL NOTIFICATIONS (Offline Alarms)                                        │
│                                                                             │
│ [React Native App] ──(Direct Schedule)──> [Device OS Alarm Engine]          │
│                                                                             │
│ • Works 100% OFFLINE (even in airplane mode!)                               │
│ • Zero backend server load or cost                                          │
│ • Precise OS-level scheduled timers (fires exactly at the requested second) │
│ • Best for: Calendar reminders, alarms, to-do due dates, habit trackers     │
└─────────────────────────────────────────────────────────────────────────────┘
```

> For personal event reminders and habit tracking, **Local Scheduled Notifications** are faster, more reliable, privacy-friendly, and cost nothing to run!

---

## 3. Architecture & File Breakdown

Here is how our notification architecture fits cleanly into the existing 4-layer architecture:

```text
┌─────────────────────────────────────────────────────────┐
│ 1. DATA TYPES                                           │
│    src/types/event.types.ts                             │
│    Adds notificationId and reminderOffsetMinutes        │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 2. NOTIFICATION SERVICE                                 │
│    src/services/notificationService.ts                  │
│    Permissions, Channels, Time math, OS scheduling      │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 3. EVENT SERVICE (Database + Notification Glue)         │
│    src/services/eventService.ts                         │
│    Coordinates Firestore CRUD with Notification alarms  │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 4. REACT HOOK & STATE                                   │
│    src/hooks/useEvents.ts                               │
│    Exposes createEvent, toggleEvent, deleteEvent        │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 5. USER INTERFACE (UI)                                  │
│    CreateEventModal.tsx  (Pick reminder offset)         │
│    EventCard.tsx         (Shows 🔔 badge)               │
│    app/(app)/index.tsx   (Dashboard glue)               │
│    app/_layout.tsx       (Runs initNotifications)       │
└─────────────────────────────────────────────────────────┘
```

---

### Layer 1: Data Types (`src/types/event.types.ts`)
We extend our data model to remember the notification reference:

```typescript
export interface EventItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string;               // e.g. "2026-09-08"
  time: string;               // e.g. "13:00"
  isCompleted: boolean;
  notificationId?: string;    // OS-assigned ID to cancel if needed
  reminderOffsetMinutes?: number; // 0, 5, 15, 30, or undefined
  createdAt: string;
  updatedAt: string;
}
```

---

### Layer 2: Notification Service (`src/services/notificationService.ts`)
This service isolates all native notification interactions.

#### 1. Foreground Presentation & Android Channels
By default, mobile operating systems do not show banners if the app is already in the foreground. We explicitly enable this:

```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

On Android 8.0+ (API 26+), notifications **require** a channel. Without a channel, Android silently drops the notification!
```typescript
if (Platform.OS === 'android') {
  await Notifications.setNotificationChannelAsync('lockedin-reminders', {
    name: 'Event Reminders',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4F46E5',
    sound: 'default',
  });
}
```

#### 2. Date & Time Parsing Math
The service parses `"2026-09-08"` and `"13:00"` (or `"1:00 PM"`) into a JavaScript `Date` object:
```typescript
const eventDateTime = parseDateTime(eventDate, eventTime);
// Subtract offset (e.g. 15 minutes before)
const triggerDate = new Date(eventDateTime.getTime() - offsetMinutes * 60 * 1000);
```

#### 3. Scheduling with the OS
```typescript
const notificationId = await Notifications.scheduleNotificationAsync({
  content: {
    title: `LockedIn: ${eventTitle}`,
    body: offsetMinutes === 0
      ? `It's time! Start: "${eventTitle}"`
      : `Starting in ${offsetMinutes} minutes: "${eventTitle}"`,
    sound: true,
    channelId: 'lockedin-reminders',
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: triggerDate,
  },
});
```

#### 4. Safe Cancellation
```typescript
async cancelEventReminder(notificationId?: string) {
  if (!notificationId || Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
```

---

### Layer 3: Event Service Integration (`src/services/eventService.ts`)
The `eventService` orchestrates both Firebase and Notifications:

1. **Creating an Event**:
   ```typescript
   // 1. If reminder is selected, schedule notification
   let notificationId: string | undefined;
   if (input.reminderOffsetMinutes !== undefined) {
     notificationId = await notificationService.scheduleEventReminder(
       input.title,
       input.date,
       input.time,
       input.reminderOffsetMinutes
     );
   }

   // 2. Save event in Firestore with notificationId
   const docRef = await addDoc(collection(db, 'events'), {
     ...input,
     notificationId: notificationId || null,
   });
   ```

2. **Completing an Event**:
   ```typescript
   // If completed and there was an active reminder, cancel it
   if (isCompleted && notificationId) {
     await notificationService.cancelEventReminder(notificationId);
   }
   await updateDoc(doc(db, 'events', eventId), { isCompleted });
   ```

3. **Deleting an Event**:
   ```typescript
   // Cancel notification if it exists
   if (notificationId) {
     await notificationService.cancelEventReminder(notificationId);
   }
   await deleteDoc(doc(db, 'events', eventId));
   ```

---

### Layer 4: UI Components

#### Selection in `CreateEventModal.tsx`:
We render friendly chips:
- `No Reminder` (`undefined`)
- `At Event Time` (`0`)
- `5m Before` (`5`)
- `15m Before` (`15`)
- `30m Before` (`30`)

When tapped, the modal passes `reminderOffsetMinutes` to the creation handler.

#### Indicator in `EventCard.tsx`:
If the event has a scheduled reminder, `EventCard` shows:
```tsx
{reminderLabel && !event.isCompleted && (
  <View className="flex-row items-center bg-indigo-50 px-2 py-0.5 rounded-full">
    <Ionicons name="notifications" size={10} color="#4F46E5" />
    <Text className="text-[10px] text-indigo-600 font-semibold ml-1">
      {reminderLabel}
    </Text>
  </View>
)}
```

---

## 4. How to Test Reminders on Your Device

1. **Run the App**:
   ```bash
   npx expo start
   ```
2. **Open in Expo Go** on your physical phone (or Android / iOS Emulator).
3. **Create a Test Event**:
   - Title: `Test Reminder`
   - Time: Choose a time **2 or 3 minutes in the future** (e.g. if it is currently 12:05 PM, select 12:07 PM).
   - Reminder: Select `At Event Time`.
   - Tap `Save Event`.
4. **Watch the Notification**:
   - You can lock your phone or keep the app open.
   - At 12:07 PM, your phone will vibrate, play the notification sound, and show the banner:
     > **LockedIn: Test Reminder**  
     > *It's time! Start: "Test Reminder"*
5. **Test Cancellation**:
   - Create another event scheduled for 10 minutes later.
   - Tap the checkmark icon to mark it complete.
   - The notification is cancelled and will not ring!

---

## 5. Common Pitfalls & How We Avoided Them

| Pitfall | Why it happens | How LockedIn Solves It |
| :--- | :--- | :--- |
| **Silent drop on Android** | Android 8+ requires a notification channel. | Configured `Notifications.setNotificationChannelAsync('lockedin-reminders', ...)` with `MAX` importance in `initNotifications()`. |
| **No notification when app is open** | Default iOS/Android behavior suppresses banners if the app is active. | Configured `Notifications.setNotificationHandler` with `shouldShowAlert: true`. |
| **Web crash** | `expo-notifications` native methods don't run in standard browsers. | Guarded with `if (Platform.OS === 'web') return;` throughout `notificationService.ts`. |
| **Past time bug** | User sets a reminder for a time that already passed. | Verified `triggerDate.getTime() > Date.now()`; skips scheduling if past. |
| **Lingering notifications after deletion** | User deletes an event, but the phone still rings later. | Stored `notificationId` in Firestore; called `cancelScheduledNotificationAsync` during `deleteEvent` and `toggleEvent`. |
