const { Payment, Order } = require('../models')
const ValidateError = require('../middlewares/ValidateError')
const cloudinary = require('cloudinary').v2
const fs = require('fs')



async function createPayment(req, res, next) {
  req.file ? { path } = req.file : path = ""
  const { id } = req.user
  const { bankAccountId, orderId } = req.body

  const paidOrder = await Payment.findOne({ where: { orderId } })

  if (path) {
    try {
      console.log(path)
      console.log(id)
      if (bankAccountId.trim() === "") throw new ValidateError('Account can not be blank', 400)
      if (!bankAccountId) throw new ValidateError('Account is required', 400)
      if (!orderId) throw new ValidateError('Order number is required', 400)
      if (orderId.trim() === "") throw new ValidateError('Order number can not be blank', 400)
      if (paidOrder) throw new ValidateError('This order number is paid', 400)

      cloudinary.uploader.upload(path, async (err, result) => {
        if (err) return next(err)

        const sendData = {
          customerId: id,
          slip: result.secure_url,
          bankAccountId,
          orderId,
          status: 'Upload'
        }

        const data = await Payment.create(sendData, { where: { id } })
        await Order.update({ orderStatus: 'Paid' }, { where: { id: orderId } })

        fs.unlinkSync(path)

        res.status(200).json({ message: `Paid`, data })
      })
    } catch (err) {
      next(err)
    }

  } else {
    const { id } = req.user
    const { slip, bankAccountId, orderId, status } = req.body
    try {
      const sendData = {
        customerId: id,
        slip,
        bankAccountId,
        orderId,
        status
      }
      const paidOrder = await Payment.findOne({ where: { orderId } })
      if (paidOrder) throw new ValidateError('This order number is paid', 400)
      const data = await Payment.create(sendData, { where: { id } })
      await Order.update({ orderStatus: 'Paid' }, { where: { id: orderId } })

      res.status(200).json({ message: `Paid`, data })
    } catch (err) {
      next(err)
    }
  }

}

async function editPayment(req, res, next) {
  req.file ? { path } = req.file : path = ""
  const { id } = req.user
  const { bankAccountId, orderId, status } = req.body
  const beforeUpdate = await Payment.findOne({ where: { id: req.params.id } })
  const statusOrder = await Order.findOne({ where: { id: beforeUpdate.orderId } })
  if (path) {
    try {
      console.log('done')
      if (beforeUpdate.status === "Confirmed") throw new ValidateError('This payment is confirmed', 400)
      if (statusOrder.status === "In transit") throw new ValidateError('This payment is confirmed', 400)

      cloudinary.uploader.upload(path, async (err, result) => {
        if (err) return next(err)

        const sendData = {
          customerId: id,
          slip: result.secure_url || beforeUpdate.slip,
          bankAccountId,
          orderId: orderId || beforeUpdate.orderId,
          status: status || beforeUpdate.status
        }

        await Payment.update(sendData, { where: { id: req.params.id } })

        fs.unlinkSync(path)

        res.status(200).json({ message: `Updated` })
      })
    } catch (err) {
      next(err)
    }
  } else {
    console.log('work')
    const sendData = {
      customerId: id,
      slip: beforeUpdate.slip,
      bankAccountId: bankAccountId || beforeUpdate.bankAccountId,
      orderId: orderId || beforeUpdate.orderId,
      status: status || beforeUpdate.status
    }
    await Payment.update(sendData, { where: { id: req.params.id } })
    res.status(200).json({ message: `Updated` })
  }
}

async function getPayment(req, res, next) {
  const { isAdmin, id } = req.user
  const { status, single } = req.query
  const search = { where: { customerId: id } }

  status ? search.where = { status } : search.where = search.where
  single ? search.where = { id: single } : search.where = search.where
  isAdmin === 'Admin' ? data = await Payment.findAll() : data = await Payment.findAll({ search })
  res.status(200).json({ data })
}

module.exports = {
  createPayment,
  editPayment,
  getPayment
}