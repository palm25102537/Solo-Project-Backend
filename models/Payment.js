module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment',
    {
      slip: { type: DataTypes.STRING, allowNull: false, unique: true },
      status: { type: DataTypes.ENUM({ values: ['Upload', `Confirmed`, `Rejected`] }), allowNull: false }
    }, {
    tableName: 'payments', underscored: true
  })
  Payment.associate = models => {
    Payment.belongsTo(models.AdminBankAccount, {
      foreignKey: {
        name: 'bankAccountId',
        allowNull: false
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    })
    Payment.belongsTo(models.Customer, {
      foreignKey: {
        name: 'customerId',
        allowNull: false
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    })
    Payment.belongsTo(models.Order, {
      foreignKey: {
        name: 'orderId',
        allowNull: false
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    })
  }
  return Payment
}