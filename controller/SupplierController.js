const { sequelize, Supplier } = require('../models')
const ValidateError = require('../middlewares/ValidateError')

async function createSupplier(req, res, next) {

  const transaction = await sequelize.transaction()

  try {

    const { name, address } = req.body

    if (!name) throw new ValidateError(`Supplier's name is required`, 400)
    if (name.trim() === "") throw new ValidateError(`Supplier's name can not be blank`, 400)

    const data = await Supplier.create({ name, address, status: 'Trade' }, { transaction })

    await transaction.commit()

    res.status(200).json({ message: `Created new supplier`, data })



  } catch (err) {

    await transaction.rollback()

    next(err)

  }
}

async function editSupplier(req, res, next) {
  try {
    const { id } = req.params
    const { name, address, status } = req.body
    const beforeUpdate = await Supplier.findOne({ where: { id } })

    if (!beforeUpdate) return res.status(400).json({ message: `This supplier is not found` })
    if (name) {
      if (name.trim() === "") return res.status(400).json({ message: `Supplier's name can not be blank` })
    }
    if (status) {
      if (status.trim() === "") return res.status(400).json({ message: `Supplier's status can not be blank` })
    }
    const sendData = {
      name: name || beforeUpdate.name,
      address: address || beforeUpdate.address,
      status: status || beforeUpdate.status
    }

    await Supplier.update(sendData, { where: { id } })
    res.status(200).json({ message: `Updated` })
  } catch (err) {
    console.log(err)
    next(err);
  }
}
async function getSupplierBy(req, res, next) {
  try {
    const { sort, item, desc, single, lim } = req.query

    let search = { where: { status: `Trade` } }

    let data;

    let condition = {}

    if (single && !sort) search.where = { id: `${single}` }



    sort ? condition = { ...search, order: [[`${item}`, desc ? "DESC" : "ASC"]], limit: lim ? +lim : null } : condition = { ...search }

    single ? data = await Supplier.findOne(condition) : data = await Supplier.findAll(condition)



    if (data === null) return res.status(400).json({ message: `There is no this supplier` })
    return res.status(200).json({ data })

  } catch (err) {
    console.log(err)
    next(err);
  }
}

module.exports = {
  createSupplier,
  editSupplier,
  getSupplierBy
}