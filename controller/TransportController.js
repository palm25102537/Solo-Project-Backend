const { sequelize, Transport } = require('../models')
const ValidateError = require('../middlewares/ValidateError')

async function createTransport(req, res, next) {

  const transaction = await sequelize.transaction()

  try {
    const { name } = req.body
    const { isAdmin } = req.payload

    if (!name) throw new ValidateError(`Transport'name is required`, 400)
    if (name.trim() === "") throw new ValidateError(`Transport's name can not be blank`, 400)
    if (isAdmin === 'Not admin') throw new ValidateError(`Require role Admin`, 400)
    const sendData = {
      name: name,
      status: 'Use'
    }


    const data = await Transport.create(sendData, { transaction })
    await transaction.commit()
    res.status(200).json({ message: `Created new transport`, data })

  } catch (err) {

    await transaction.rollback()

    next(err)

  }
}

async function editTransport(req, res, next) {
  try {
    const { id } = req.params
    const { name, status } = req.body

    const beforeUpdate = await Transport.findOne({ where: { id } })
    if (!beforeUpdate) return res.status(400).json({ message: `This transport is not found` })
    if (name) {
      if (name.trim() === "") return res.status(400).json({ message: `Transport's name can not be blank` })
    }
    if (status) {
      if (status.trim() === "") return res.status(400).json({ message: `Transport's status can not be blank` })
    }
    const sendData = {
      name: name || beforeUpdate.name,
      status: status || beforeUpdate.status
    }
    await Transport.update(sendData, { where: { id } })
    res.status(200).json({ message: `Updated` })

  } catch (err) {
    console.log(err)
    next(err);
  }
}

async function getTransport(req, res, next) {
  try {
    const { sort, item, desc, single, lim } = req.query

    let search = { where: { status: `Use` } }

    let data;

    let condition = {}

    if (single && !sort) search.where = { id: `${single}` }



    sort ? condition = { ...search, order: [[`${item}`, desc ? "DESC" : "ASC"]], limit: lim ? +lim : null } : condition = { ...search }

    single ? data = await Transport.findOne(condition) : data = await Transport.findAll(condition)



    if (data === null) return res.status(400).json({ message: `There is no this transport` })
    return res.status(200).json({ data })

  } catch (err) {
    console.log(err)
    next(err);
  }

}



module.exports = {
  createTransport,
  getTransport,
  editTransport
}