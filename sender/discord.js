const { Webhook } = require('discord-webhook-node')
const dotenv = require('dotenv')

dotenv.config()

async function send(filePath) {
  const hook = new Webhook(process.env.WEBHOOK_URL ?? '')
  hook.setUsername(process.env.WEBHOOK_NAME ?? 'Invoice')
  hook.setAvatar(process.env.WEBHOOK_IMG ?? '')

  try {
    await hook.sendFile(filePath)
    console.info('discord: File uploaded!')
  } catch (e) {
    await hook.send(`error sending invoice: ${e}`)
  }
}

module.exports = {
  send,
}