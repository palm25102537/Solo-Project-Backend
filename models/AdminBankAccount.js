module.exports = (sequelize, DataTypes) => {
  const AdminBankAccount = sequelize.define('AdminBankAccount',
    {
      name: { type: DataTypes.STRING, allowNull: false },
      accountNumber: { type: DataTypes.STRING, allowNull: false },
      bankName: { type: DataTypes.STRING, allowNull: false }
    }, {
    tableName: 'bankAccounts', underscored: true, timestamps: false
  })
  AdminBankAccount.associate = models => {
    AdminBankAccount.hasMany(models.Payment, {
      foreignKey: {
        name: 'bankAccountId',
        allowNull: false
      },
      onUpdate: 'RESTRICT',
      onDelete: 'RESTRICT',
    })
  }
  return AdminBankAccount
}