const express = require('express')
const app = express()
const { generateInvoice } = require('./invoice')
const dotenv = require('dotenv')

dotenv.config()

const PORT = process.env.PORT ?? 3000

app.use(express.json())

app.post('*', async (req, res) => {
  try {
    const { orderId, customerInfo, commandLines } = req.body

    if (!orderId || !customerInfo || !commandLines) {
      res.status(400).send('Invalid request data')
      return
    }

    const pdf = await generateInvoice(orderId, customerInfo, commandLines)

    // Send PDF file in response
    res.contentType('application/pdf')
    res.send(pdf)
  } catch (error) {
    console.error(error)
    res.status(500).send('Error generating invoice')
  }
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})