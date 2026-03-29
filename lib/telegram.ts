export async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    const data = await res.json()
    if (!res.ok) return { ok: false, error: data.description ?? 'Unknown error' }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
