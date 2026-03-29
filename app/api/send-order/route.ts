import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request: Request) {
  const BOT_TOKEN = process.env.BOT_TOKEN
  const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID

  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    return Response.json(
      { ok: false, error: 'Server configuration missing' },
      { status: 500 },
    )
  }

  let text: string
  let senderId: number | undefined

  try {
    const body = await request.json()
    text = body.text
    senderId = body.senderId
  } catch {
    return Response.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
  }

  const adminResult = await sendTelegramMessage(BOT_TOKEN, ADMIN_CHAT_ID, text)

  if (senderId) {
    await sendTelegramMessage(
      BOT_TOKEN,
      senderId,
      `✅ Buyurtmangiz qabul qilindi ⬇️\n\n${text}`,
    )
  }

  if (!adminResult.ok) {
    return Response.json({ ok: false, error: adminResult.error }, { status: 502 })
  }

  return Response.json({ ok: true })
}
