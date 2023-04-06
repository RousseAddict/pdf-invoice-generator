const { validateCart } = require('../validate')

const toLineItems = (cart) => {
  const { commandLines } = validateCart(cart)

  return commandLines.map(line => ({
    price_data: { 
      currency: 'eur', 
      product_data: {
        name: line.name,
        description: line.description
      }, 
      unit_amount: line.unitPrice * 100, 
    }, 
    quantity: line.quantity, 
  }))
  
}


module.exports = {
  toLineItems
}