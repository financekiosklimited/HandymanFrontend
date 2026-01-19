import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

/**
 * Register for push notifications and get the Expo push token.
 * Returns the token string or null if registration fails.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null

  // Check if running on a physical device (required for push notifications)
  if (!Device.isDevice) {
    return null
  }

  // Check and request notification permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return null
  }

  try {
    // Get the Expo push token
    const pushTokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'handymankiosk', // Firebase project ID
    })
    token = pushTokenData.data
  } catch (error) {
    console.error('Error getting push token:', error)
    return null
  }

  // On Android, set up notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0C9A5C',
    })
  }

  return token
}

/**
 * Add a listener for when a notification is received while the app is foregrounded.
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback)
}

/**
 * Add a listener for when the user taps on a notification.
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback)
}

/**
 * Get the notification that was used to open the app (if any).
 */
export async function getLastNotificationResponse() {
  return await Notifications.getLastNotificationResponseAsync()
}

/**
 * Schedule a local notification (for testing).
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Immediate
  })
}

export { Notifications }
