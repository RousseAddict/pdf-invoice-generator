const PDFDocument = require('pdfkit')
const fs = require('fs')
const dotenv = require('dotenv')
const { send: sendDiscord } = require('./sender/discord')
const { send: sendGDrive } = require('./sender/gdrive')

dotenv.config()

async function sendInvoice(filePath) {
  if (process.env.WEBHOOK_URL) {
    await sendDiscord(filePath)
  }
  if (process.env.GOOGLE_DRIVE_CLIENT_ID) {
    await sendGDrive(filePath)
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

  // Order lines
  doc.fontSize(12).text('Order Lines:')
  for (const commandLine of commandLines) {
    const { name, description, totalPrice: lineTotal } = commandLine
    doc.fontSize(10).text(`${name} - ${description} - $${lineTotal}`, { align: 'right' })
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