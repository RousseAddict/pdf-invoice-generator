const PDFDocument = require('pdfkit')
const fs = require('fs')
const { Webhook } = require('discord-webhook-node')
const dotenv = require('dotenv')

dotenv.config()

async function sendInvoice(filePath) {
  const hook = new Webhook(process.env.WEBHOOK_URL ?? '')
  hook.setUsername(process.env.WEBHOOK_NAME ?? 'Invoice')
  hook.setAvatar(process.env.WEBHOOK_IMG ?? '')

  try {
    await hook.sendFile(filePath)
  } catch (e) {
    await hook.send(`error sending invoice: ${e}`)
  }
}

async function generateInvoice(orderId, customerInfo, commandLines) {
  const doc = new PDFDocument()
  let totalPrice = 0

  doc.fontSize(16).text('Invoice', { align: 'center' })
  doc.moveDown()
  doc.text(`Order ID: ${orderId}`)
  doc.moveDown()

  // Customer information
  doc.fontSize(12).text('Customer Information:')
  doc.fontSize(10).text(`Name: ${customerInfo.fullName}`)
  doc.text(`Email: ${customerInfo.email}`)
  doc.text(`Address: ${customerInfo.address}`)
  doc.text(`Phone: ${customerInfo.phone}`)
  doc.moveDown()

  // Command lines
  doc.fontSize(12).text('Command Lines:')
  for (const commandLine of commandLines) {
    const { name, description, totalPrice: lineTotal } = commandLine
    doc.fontSize(10).text(`${name} - ${description} - $${lineTotal}`)
    totalPrice += lineTotal
  }
  doc.moveDown()

  // Total price
  doc.fontSize(14).text(`Total: $${totalPrice}`, { align: 'right' })

  // Save PDF to a file
  const filePath = `invoice_${orderId}.pdf`
  doc.pipe(fs.createWriteStream(filePath)).on('finish', async () => {
    await sendInvoice(filePath)

    // Delete the local PDF file
    fs.unlinkSync(filePath)
  })

  doc.end()
}

module.exports = {
  sendInvoice,
  generateInvoice,
}