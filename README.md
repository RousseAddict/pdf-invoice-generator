# Invoice generator

This node script will generate a PDF invoice and send it through discord using a webhook.

## Setup

run `npm i`

**Env variable to setup?**

Server

- `PORT` (optional): set a custom port to the server. Default: 3000

PDF Generation

- `WEBHOOK_URL` (mandatory): correspond to the discord webhook url where we'll push the invoice
- `WEBHOOK_NAME` (optional): set up a custom name for the discord bot. Default value: Invoice
- `WEBHOOK_IMG` (optional): set up a custom avatar image for the discord bot.


## Usage example

### Using the function only

```js
const orderId = '12345'
const customerInfo = { fullName: 'John Doe', email: 'john.doe@example.com', address: '123 Main St.', phone: '+1...' }
const commandLines = [
  { name: 'Product 1', description: '10x10x10', totalPrice: 25 },
  { name: 'Product 2', description: '20x20x20', totalPrice: 50 },
]

generateInvoice(orderId, customerInfo, commandLines)
  .then(() => console.log('Invoice generated and sent!'))
  .catch((err) => console.error(err))
```

### Using the API

Start the server and call the API with a post

- add header : `content-type: application/json`
- add body JSON :

```JSON
{
  "commandLines": [
    {
      "description": "10x10x10",
      "name": "Product 1",
      "totalPrice": 25
    },
    {
      "description": "20x20x20",
      "name": "Product 2",
      "totalPrice": 50
    }
  ],
  "customerInfo": {
    "address": "123 Main St.",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "phone": "+13456"
  },
  "orderId": "12345"
}
```
