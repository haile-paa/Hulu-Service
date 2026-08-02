// Vercel serverless function — handles Telegram's webhook calls.
// Only job: reply to /start with a welcome message + a button that opens
// this same deployment as the mini app (matches the Ocu-Care UX: an
// in-chat message with its own "Open Mini-App" button, in addition to the
// persistent menu button pill BotFather already set up).
//
// No bot framework needed for just this — one command, one message.

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(200).send("ok");
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is not set in Vercel env vars");
    res.status(200).send("ok"); // still 200 so Telegram doesn't retry forever
    return;
  }

  const update = req.body;
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = message?.text || "";

  if (chatId && text.startsWith("/start")) {
    // Build the mini app URL from the request's own host, so it always
    // matches wherever this is actually deployed — no separate env var
    // to keep in sync.
    const miniAppUrl = `https://${req.headers.host}`;
    const firstName = message.from?.first_name || "";

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `👋 እንኳን ደህና መጡ${firstName ? ", " + firstName : ""}! ወደ Hulu Service\n\nከታች ያለውን አዝራር በመጫን መተግበሪያውን ይክፈቱ።`,
        reply_markup: {
          inline_keyboard: [
            [{ text: "📱 Open Mini-App", web_app: { url: miniAppUrl } }],
          ],
        },
      }),
    });
  }

  res.status(200).send("ok");
};
