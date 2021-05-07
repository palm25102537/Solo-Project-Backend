


const error = (err, req, res, next) => {
  console.log(err)


  if (err.code) return res.status(err.code).json({ message: err.message })

  const [ValidationErrorItem] = err.errors
  console.log(ValidationErrorItem)
  if (ValidationErrorItem.message === 'transports.name must be unique') return res.status(400).send(`Transport's name must be unique`)
  if (ValidationErrorItem.message === "products.name must be unique") return res.status(400).send(`Product's name must be unique`)
  if (ValidationErrorItem.message === "suppliers.name must be unique") return res.status(400).send(`Supplier's name must be unique`)
  if (ValidationErrorItem.message === "customers.username must be unique" || ValidationErrorItem.message === "customers.email must be unique")
    return res.status(400).send(`Username and email must be unique`)
  if (ValidationErrorItem.message === "orders.tracking_number must be unique") return res.status(400).send(`Tracking number must be unique`)
  if (ValidationErrorItem.message === "categories.name must be unique") return res.status(400).send(`Category name must be unique`)
  res.status(500).json({ message: err.message })
}

module.exports = error