const express = require('express')
const app = express()
const cors = require('cors')
const { generateInvoice } = require('./invoice')
const dotenv = require('dotenv')

dotenv.config()

const PORT = process.env.PORT ?? 3000

const whitelist = (process.env.CORS_DOMAINS || '').split(',').map(item => item.trim())

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}

if (process.env.NODE_ENV !== 'development') {
  app.use(cors(corsOptions))
}

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