async function sendNotification() {
  const response = await fetch(
    "https://notification.qstack.com.ng/api/v1/notifications/notify",
    {
      method: "POST",
      headers: {
        "X-API-Key": "YOUR_API_KEY", // Generate in API Keys tab
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: "admin", // Target channel name
        title: "System Alert",
        body: "Version 2.4.0 is now live in production.",
        payload: {
          environment: "production",
        },
      }),
    },
  );

  const data = await response.json();
  console.log(data);
}

sendNotification();
