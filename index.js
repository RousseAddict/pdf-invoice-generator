const express = require('express')
const app = express()
const cors = require('cors')
const { generateInvoice } = require('./invoice')
const { validate, validateCart } = require('./validate')
// const { toLineItems } = require('./utils/toLineItems')
const dotenv = require('dotenv')

dotenv.config()

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

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

app.post('/heartbeat', async (req, res) => {
  res.json({})
})

app.post('/create-payment', async (req, res) => {
  try {
    const { cart, customerInfo } = req.body

    if (!cart || !customerInfo) {
      res.status(400).send('Invalid request data')
      return
    }

    const isValid = validate(cart, customerInfo)

    if (isValid) {
      // const session = await stripe.checkout.sessions.create({ 
      //   payment_method_types: ['card'],
      //   line_items: toLineItems(cart), 
      //   mode: 'payment', 
      //   success_url: `http://localhost:${PORT}/success`, 
      //   cancel_url: `http://localhost:${PORT}/cancel`, 
      // });
    
      const { total, commandLines } = validateCart(cart)

      const paymentIntent = await stripe.paymentIntents.create({
        amount: total * 100, //stripe needs an integer including the smallest possible values for the currency
        currency: 'eur',
        payment_method_types: ['card'],
        metadata: {
          commandLines: JSON.stringify(commandLines),
          customerInfo: JSON.stringify(customerInfo),
          orderId: `order-${customerInfo.fullName.substring(0, 1)}-${Date.now()}`,
        }
      })

    
      return res.json({
        isValid,
        clientSecret: paymentIntent.client_secret,
        cart,
        total,
      })
    }

    return res.json({ isValid })
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: error || 'Error validating data' })
  }
})

app.get('/check-payment', async (req, res) => {

  if (!req.query.id) {
    res.status(400).send('No id passed')
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.query.id)
  
    return res.json({
      status: paymentIntent.status,
      orderId: paymentIntent.metadata.orderId,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: error || 'Error validating data' })
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
    res.status(500).send({ error: error || 'Error generating invoice' })
  }
})

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})