const { sequelize, Product, Category, Supplier } = require('../models')
const ValidateError = require('../middlewares/ValidateError')
const cloudinary = require('cloudinary').v2
const fs = require('fs')

async function createProduct(req, res, next) {
  const transaction = await sequelize.transaction()
  const { product } = req.body

  try {

    for (key of product) {
      const isURL = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/
      if (!key.name) throw new ValidateError(`Product's name is required`, 400)
      if (key.name.trim() === "") throw new ValidateError(`Product's name can not be blank`, 400)
      if (isNaN(key.price)) throw new ValidateError(`Price must be integer`, 400)
      if (isNaN(key.amount)) throw new ValidateError(`Amount must be integer`, 400)
      if (!key.supplierId) throw new ValidateError(`Supplier Id is required`, 400)
      if (isNaN(key.supplierId)) throw new ValidateError(`Supplier Id must be integer`, 400)
      if (key.picture) {
        if (!isURL.test(key.picture)) throw new ValidateError(`Product picture must save in URL`, 400)
      }

    }
    const insertData = await Promise.all(product.map((item) => {
      item.status = 'Avaliable'
      item.description = item.description || 'Please insert the descrtiption'
      return item
    }))

    console.log(insertData)

    const data = await Product.bulkCreate(insertData, { transaction })

    await transaction.commit()

    res.status(200).json({ message: `Created new product`, data })

  } catch (err) {
    await transaction.rollback()
    next(err);
  }
}


async function getProductBy(req, res, next) {
  try {
    if (req.user) {
      const { isAdmin } = req.user
      const { sort, item, desc, single, lim, category } = req.query

      let search = isAdmin === 'Admin' ? {
        include: [
          { model: Category, attributes: ['name'] },
          { model: Supplier, attributes: ['name'] }
        ]
      } : { where: { status: `Avaliable` } }

      let data;

      let condition = {}

      if (single && !sort) search.where = { id: `${single}` }



      if (category) search.where = { categoryId: `${category}`, status: 'Avaliable' }

      console.log(search)
      sort ? condition = { ...search, order: [[`${item}`, desc ? "DESC" : "ASC"]], limit: lim ? +lim : null } : condition = { ...search }
      category ? condition = {
        ...search,
        include: [
          { model: Category, attributes: ['name'] }
        ]
      } : condition = { ...search }

      single ? data = await Product.findOne(condition) : data = await Product.findAll(condition)



      if (data === null) return res.status(400).json({ message: `There is no this product` })
      return res.status(200).json({ data })
    } else {
      const { sort, item, desc, single, lim, category } = req.query

      let search = { where: { status: `Avaliable` } }

      let data;

      let condition = {}

      if (single && !sort) search.where = { id: `${single}` }



      if (category) search.where = { categoryId: `${category}`, status: 'Avaliable' }

      console.log(search)
      sort ? condition = { ...search, order: [[`${item}`, desc ? "DESC" : "ASC"]], limit: lim ? +lim : null } : condition = { ...search }
      category ? condition = {
        ...search,
        include: [
          { model: Category, attributes: ['name'] }
        ]
      } : condition = { ...search }

      single ? data = await Product.findOne(condition) : data = await Product.findAll(condition)



      if (data === null) return res.status(400).json({ message: `There is no this product` })
      return res.status(200).json({ data })
    }


  } catch (err) {
    console.log(err)
    next(err);
  }

}
async function editProduct(req, res, next) {

  try {
    req.file ? { path } = req.file : path = ""
    const { id } = req.params
    const { name, price, status, description, amount, supplierId, promotion, categoryId } = req.body

    const beforeUpdate = await Product.findOne({ where: { id } })

    if (!beforeUpdate) return res.status(400).json({ message: `This product is not found` })


    if (price) {
      if (isNaN(price)) return res.status(400).json({ message: `Price must be integer` })

    }


    if (amount) {
      if (isNaN(amount)) return res.status(400).json({ message: `Amount must be integer` })

    }
    if (supplierId) {
      if (isNaN(supplierId)) return res.status(400).json({ message: `Supplier Id must be integer` })

    }


    if (path) {

      cloudinary.uploader.upload(path, async (err, result) => {
        if (err) return next(err)

        const sendData = {

          picture: result.secure_url
        }
        console.log('work')
        await Product.update(sendData, { where: { id } })


        fs.unlinkSync(path)

        res.status(200).json({ message: `Updated` })
      })
    } else {
      const sendData = {
        name: name || beforeUpdate.name,
        price: price || beforeUpdate.price,
        status: status || beforeUpdate.status,
        description: description || beforeUpdate.description,
        amount: (amount === 0) ? amount : (!amount) ? beforeUpdate.amount : amount,
        supplierId: supplierId || beforeUpdate.supplierId,
        promotion: promotion || beforeUpdate.promotion,
        categoryId: categoryId || beforeUpdate.categoryId
      }

      await Product.update(sendData, { where: { id } })
      res.status(200).json({ message: `Updated` })
    }

  } catch (err) {
    console.log(err)
    next(err);
  }

}


module.exports = {
  createProduct,
  getProductBy,
  editProduct,
}
