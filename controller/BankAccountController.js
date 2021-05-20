const { sequelize, AdminBankAccount } = require('../models')
const ValidateError = require('../middlewares/ValidateError')

async function createAccount(req, res, next) {
  const { isAdmin } = req.user
  const { name, accountNumber, bankName } = req.body

  const transaction = await sequelize.transaction()
  try {
    if (!name) throw new ValidateError("Your name is required", 400)
    if (name.trim() === "") throw new ValidateError('Your name can not be blank', 400)
    if (!accountNumber) throw new ValidateError('Account number is required', 400)
    if (isAdmin !== 'Admin') throw new ValidateError('Required role admin', 401)
    if (!bankName) throw new ValidateError('Bank name is required', 400)
    if (bankName.trim() === "") throw new ValidateError('Bank name can not be blank', 400)

    const data = await AdminBankAccount.create({ name, accountNumber, bankName }, { transaction })

    await transaction.commit()
    res.status(400).json({ message: 'Created', data })

  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

async function editAccount(req, res, next) {
  const { id } = req.params
  const { name, accountNumber, bankName } = req.body
  const { isAdmin } = req.user
  const beforeUpdate = await AdminBankAccount.findOne({ where: { id } })
  try {
    if (isAdmin !== 'Admin') throw new ValidateError('Required role admin', 401)
    if (!beforeUpdate) throw new ValidateError('Can not found this account', 400)
    const sendData = {
      name: name || beforeUpdate.name,
      accountNumber: accountNumber || beforeUpdate.accountNumber,
      bankName: bankName || beforeUpdate.bankName
    }

    await AdminBankAccount.update(sendData, { where: { id } })

    res.status(400).json({ message: 'Updated' })
  } catch (err) {
    next(err)
  }

}

async function getAccount(req, res, next) {
  const { id } = req.query

  try {

    id ? data = await AdminBankAccount.findOne({ where: { id } }) : data = await AdminBankAccount.findAll()
    if (!data) throw new ValidateError('Can not found this account', 400)
    res.status(200).json({ data })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createAccount,
  editAccount,
  getAccount
}