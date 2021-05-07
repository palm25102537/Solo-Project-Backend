module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    amount: { type: DataTypes.DECIMAL(10), allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount: DataTypes.DOUBLE

  },
    {
      tableName: 'order_items',
      underscored: true
    })
  OrderItem.associate = models => {
    OrderItem.belongsTo(models.Product,
      {
        foreignKey: {
          name: 'productId',
          allowNull: false
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      })
    OrderItem.belongsTo(models.Order,
      {
        foreignKey: {
          name: 'orderId',
          allowNull: false,
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      })
  }
  return OrderItem;
}