import twilio from 'twilio'

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )
}

function getFrom() {
  return process.env.TWILIO_WHATSAPP_FROM!
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s|-/g, '')
  if (cleaned.startsWith('0')) {
    return `+254${cleaned.slice(1)}`
  }
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  return `+${cleaned}`
}

export async function sendWhatsApp(to: string, message: string) {
  try {
    const client = getClient()
    const formattedTo = `whatsapp:${formatPhone(to)}`
    const result = await client.messages.create({
      from: getFrom(),
      to: formattedTo,
      body: message,
    })
    console.log(`[WHATSAPP] Sent to ${formattedTo} - SID: ${result.sid}`)
    return { success: true, sid: result.sid }
  } catch (error) {
    console.error('[WHATSAPP ERROR]', error)
    return { success: false, error }
  }
}

export const WhatsAppMessages = {
  orderConfirmed: (orderNumber: number, customerName: string) =>
    `Hi ${customerName}! 🍔 Your Grub N Snack order *#${orderNumber}* has been received.\n\nA driver will be assigned shortly. We'll update you here.\n\nSave this number for order updates.`,

  driverAssigned: (orderNumber: number, driverName: string, driverPhone: string) =>
    `✅ Great news! A driver has been assigned to your order *#${orderNumber}*.\n\nDriver: *${driverName}*\nContact: ${driverPhone}\n\nYour driver will reach out to confirm delivery details and fees.`,

  orderPicked: (orderNumber: number) =>
    `🛵 Your order *#${orderNumber}* has been picked up and is on the way!\n\nYour driver is heading to your location now.`,

  orderDelivered: (orderNumber: number) =>
    `📦 Your order *#${orderNumber}* has been delivered!\n\nThank you for ordering with Grub N Snack. Enjoy your meal! 🙏`,

  orderPendingReminder: (orderNumber: number) =>
    `⏳ Your Grub N Snack order *#${orderNumber}* is still waiting for a driver.\n\nReply *WAIT* to keep waiting or *CANCEL* to cancel your order.`,

  orderCancelled: (orderNumber: number) =>
    `❌ Your order *#${orderNumber}* has been cancelled.\n\nWe're sorry for the inconvenience. Please try ordering again — we'll make it right! 🙏`,
}
