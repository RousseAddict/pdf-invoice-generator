
const roundPrice = (price) => Math.round(price*100)/100

const computeProductPrice = (productId) => {
  // map each productId with the real price (may be we could have a matrix table)
  if (productId = '123') {
    return 12
  }

  return 0
}

const computeCustomPrice = ({
  type,
  length,
  width,
  thickness,
}) => {

  if (type === '24kgs/m³') {
    return roundPrice(length * width * thickness * 0.0005)
  }

  if (type === '28kgs/m³') {
    return roundPrice(length * width * thickness * 0.0006)
  }

  if (type === 'HR 35kgs/m³') {
    return roundPrice(length * width * thickness * 0.0008)
  }

  if (type === 'HR 40kgs/m³') {
    return roundPrice(length * width * thickness * 0.0009)
  }

  return 0
}

function validateCart (cart) {
  let isValid = true;
  const commandLines = [...cart].map((product) => {
    if (product.type && product.length && product.width && product.thickness && product.quantity) {
      return {
        name: product.name,
        description: `Type: ${product.type}. Dimension: ${product.length} x ${product.width} x ${product.thickness}. Qty: ${product.quantity}`,
        totalPrice: computeCustomPrice(product) * product.quantity,
      }
    }

    if (product.id && product.quantity) {
      return {
        name: product.name,
        description: `Qty: ${product.quantity}`,
        totalPrice: computeProductPrice(product.id) * product.quantity,
      }
    }

    isValid = false;

    return {
      name: 'invalid',
      description: 'invalid',
      totalPrice: 0,
    }
  })

  return { commandLines, isValid }
}

function validateCustomerInfo(customer) {
  if (customer.fullName && customer.email && customer.address && customer.phone) {
    return { customer, isValid: true }
  }

  return { customer, isValid: false };
}

function validate(cart, customer) {
  const { isValid: isCartValid } = validateCart(cart)
  const { isValid: isCustomerInfoValid } = validateCustomerInfo(customer)

  if (!isCartValid || !isCustomerInfoValid) {
    return false
  }
  return true
}

module.exports = {
  validateCart,
  validateCustomerInfo,
  validate,
}