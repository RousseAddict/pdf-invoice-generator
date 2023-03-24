const express = require('express')
const app = express()
const cors = require('cors')
const { generateInvoice } = require('./invoice')
const { validate, validateCart } = require('./validate')
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

app.post('/validate', (req, res) => {
  try {
    const { cart, customerInfo } = req.body

    if (!cart || !customerInfo) {
      res.status(400).send('Invalid request data')
      return
    }

    const isValid = validate(cart, customerInfo)

    res.contentType('application/json')
    res.send({ isValid })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error validating data')
  }
})

app.post('/order', async (req, res) => {
  try {
    const { cart, customerInfo } = req.body

    if (!cart || !customerInfo) {
      res.status(400).send('Invalid request data')
      return
    }
    const isValid = validate(cart, customerInfo)

    if (isValid) {
      const { commandLines } = validateCart(cart)
      const orderId = `${customerInfo.fullName}-${Date.now()}`

      await generateInvoice(orderId, customerInfo, commandLines)

      res.contentType('application/json')
      res.send({ isValid, orderId, commandLines, customerInfo })
      return
    }

    res.contentType('application/json')
    res.send({ isValid })
  } catch (error) {
    console.error(error)
    res.status(500).send('Error validating data')
  }
})


app.post('/invoice', async (req, res) => {
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