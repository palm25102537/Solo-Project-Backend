module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order',
    {
      orderStatus: {
        type: DataTypes.ENUM(
          {
            values: [`Placed Order`, `Paid`, `Ready To ship`, 'In transit', 'Delivered', 'Cancelled']
          }),
        allowNull: false
      },
      trackingNumber: { type: DataTypes.STRING, unique: true },
      deliveryAddress: { type: DataTypes.STRING, allowNull: false }

    },
    {
      tableName: 'orders',
      underscored: true
    })
  Order.associate = models => {
    Order.belongsTo(models.Transport,
      {
        foreignKey: {
          name: 'transportId',
          allowNull: false
        },
        onDlelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      })
    Order.hasMany(models.OrderItem, {
      as: 'detail',
      foreignKey: {
        name: 'orderId',
        allowNull: false
      },
      onDlelete: 'RESTRICT',
      onUpdate: 'RESTRICT'
    })
    Order.belongsTo(models.Customer,
      {
        foreignKey: {
          name: 'customerId',
          allowNull: false,
        },
        onDlelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      })
  }
  return Order
}