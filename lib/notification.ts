export interface NotificationPayload {
  channel?: string;
  title: string;
  body: string;
  payload?: Record<string, any>;
}

/**
 * Sends a notification via QStack Notification API using the API Key from environment variables.
 */
export async function sendQStackNotification({
  channel = "admin",
  title,
  body,
  payload,
}: NotificationPayload) {
  const apiKey =
    process.env.QSTACK_NOTIFICATION_API_KEY ||
    process.env.NEXT_PUBLIC_QSTACK_NOTIFICATION_API_KEY ||
    "np_eaf2c52af95c50ee475a460d9f5ec8275a41006cf0fe5216";

  const apiUrl =
    process.env.QSTACK_NOTIFICATION_URL ||
    "https://notification.qstack.com.ng/api/v1/notifications/notify";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel,
        title,
        body,
        payload: payload || {
          environment: process.env.NODE_ENV || "production",
          timestamp: new Date().toISOString(),
        },
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error("Failed to send QStack notification:", error);
    return { success: false, error: String(error) };
  }
}
