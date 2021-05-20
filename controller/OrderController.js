const { sequelize, Order, OrderItem, Product, Customer, Transport, Payment } = require('../models')
const { Op } = require('sequelize')
const ValidateError = require('../middlewares/ValidateError')

async function createOrder(req, res, next) {

  const transaction = await sequelize.transaction()
  try {

    const { id } = req.user
    const { deliveryAddress, item, transportId } = req.body



    if (!deliveryAddress) throw new ValidateError(`Delivery Address is required`, 400)
    if (deliveryAddress.trim() === "") throw new ValidateError(`Delivery Address`, 400)
    if (!item.length) throw new ValidateError(`Order must have at least one order detail`, 400)

    const sendData = {
      deliveryAddress,
      transportId,
      orderStatus: 'Placed Order',
      customerId: id,
    }

    const order = await Order.create(sendData)

    const insertData = await Promise.all(item.map(async (item) => {
      const productData = await Product.findOne({ where: { id: item.productId } })
      item.price = productData.price
      item.orderId = order.id

      return item

    }))

    for (key of insertData) {
      if (!key.amount) return res.status(400).json({ message: `Amount is required ` })
    }
    const orderList = await OrderItem.bulkCreate(insertData, { transaction })
    await transaction.commit()
    res.status(200).json({ message: `Created Order`, order, orderList })
  } catch (err) {
    await transaction.rollback()
    next(err);
  }
}

async function updateOrder(req, res, next) {
  const transaction = await sequelize.transaction()

  try {
    console.log(req.body)
    const { id } = req.params
    const { orderStatus, trackingNumber, deliveryAddress, transportId, item } = req.body
    const beforeUpdateOrder = await Order.findOne({ where: { id } })
    console.log(trackingNumber)
    if (!beforeUpdateOrder) return res.status(400).json({ message: `Can not find your order` })
    if (orderStatus) {
      if (orderStatus.trim() === "") return res.status(400).json({ message: `Order status can not be blank` })
    }

    if (deliveryAddress) {
      if (deliveryAddress.trim() === "") return res.status(400).json({ message: `Delivery Address can not be blank` })
    }

    if (trackingNumber) {
      const track = await Order.findOne({ where: { trackingNumber } })

      if (track) throw new ValidateError('This tracking number is used', 400)
    }
    const sendData = {
      orderStatus: orderStatus || beforeUpdateOrder.orderStatus,
      trackingNumber: trackingNumber || beforeUpdateOrder.trackingNumber,
      deliveryAddress: deliveryAddress || beforeUpdateOrder.deliveryAddress,
      transportId: transportId || beforeUpdateOrder.transportId
    }
    console.log(sendData)
    await Order.update(sendData, { where: { id } }, { transaction })

    if (item) {
      const insertData = await Promise.all(item.map(async (item) => {
        const productData = await OrderItem.findOne({ where: { id: item.productId } })
        item.price = item.price || productData.price
        item.orderId = id
        item.discount = item.discount || item.discount === 0 ? item.discount : productData.discount
        return item

      }))


      for (key of insertData) {
        await OrderItem.update(key, { where: { productId: key.productId, orderId: id } }, { transaction })
      }
    }


    await transaction.commit()
    res.status(200).json({ message: `Updated` })
  } catch (err) {
    console.log(err)
    await transaction.rollback()
    next(err);
  }
}
async function getOrderBy(req, res, next) {
  try {
    console.log(req.query)
    const { sort, item, desc, single, lim, me } = req.query
    const { id } = req.user
    let search = {
      where: {
        [Op.or]: [{ orderStatus: 'Placed Order' }, { orderStatus: "Paid" }, { orderStatus: `Ready To ship` }, { orderStatus: 'In transit' }, { orderStatus: 'Delivered' }]
      },
      include: [{
        model: OrderItem, as: 'detail',
        attributes: ['price', 'discount', 'amount'],
        include: [{ model: Product, attributes: ['name'] },],
      },
      { model: Customer, attributes: ['userName'] },
      { model: Transport, attributes: ['name'] },
      { model: Payment }
      ]
    }


    let data;

    let condition = {}

    if (single && !sort) search.where = {
      id: `${single}`
    }

    if (me) {
      search.where = {
        customerId: me
      }
    }
    sort ? condition = { ...search, order: [[`${item}`, desc ? "DESC" : "ASC"]], limit: lim ? +lim : null } : condition = { ...search }

    single ? data = await Order.findOne(condition) : data = await Order.findAll(condition)



    if (data === null) return res.status(400).json({ message: `There is no this product` })
    return res.status(200).json({ data })

  } catch (err) {
    console.log(err)
    next(err);
  }

}

async function getBestSeller(req, res, next) {

  try {
    let data = await OrderItem.findAll({
      attributes: [
        'id',
        'product_id',
        [sequelize.fn('SUM', sequelize.col('OrderItem.amount')), 'total_sell_amount']
      ],
      group: [`product_id`],
      limit: 5,
      order: sequelize.literal('total_sell_amount DESC'),
      include: [{
        model: Product,
        attributes: [`picture`, `name`, `price`]
      }]
    })

    res.status(200).json({ data })
  } catch (err) {
    console.log(err)
    next(err);
  }

}

module.exports = {
  createOrder,
  updateOrder,
  getOrderBy,
  getBestSeller,
}