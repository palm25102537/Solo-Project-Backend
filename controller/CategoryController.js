const { sequelize, Category } = require('../models')
const ValidateError = require('../middlewares/ValidateError')
async function createCategory(req, res, next) {
  const { isAdmin } = req.user
  const { name } = req.body
  const transaction = await sequelize.transaction()
  try {
    if (isAdmin !== 'Admin') throw new ValidateError('Require role Admin', 401)
    if (name.trim() === "") throw new ValidateError(`Category name can not be blank`, 400)
    if (!name) throw new ValidateError('Category name is required', 400)

    const respond = await Category.create({ name }, { transaction })

    await transaction.commit()
    res.status(200).json({ message: `Category create`, respond })

  } catch (err) {
    await transaction.rollback()
    next(err);
  }

}

async function editCategory(req, res, next) {
  const { id } = req.params
  const { name } = req.body
  try {
    const beforeUpdate = await Category.findOne({ where: { id } })
    if (!beforeUpdate) throw new ValidateError(`Can not find your category `, 400)

    await Category.update({ name }, { where: { id } })

    res.status(200).json({ message: `Category updated` })

  } catch (err) {
    next(err)
  }

}

async function getCategory(req, res, next) {
  const respond = await Category.findAll()


  res.status(200).json({ respond })
}
module.exports = {
  createCategory,
  editCategory,
  getCategory
}