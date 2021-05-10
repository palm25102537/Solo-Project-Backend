module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer',
    {
      name: { type: DataTypes.STRING, allowNull: false },
      userName: { type: DataTypes.STRING, allowNull: false, unique: true, field: `username` },
      password: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true }, unique: true },
      address: DataTypes.STRING,
      phoneNumber: { type: DataTypes.STRING, allowNull: false },
      isAdmin: {
        type: DataTypes.ENUM(
          {
            values: [`Not admin`, `Admin`]
          }),
        field: 'role'
      },
      status: {
        type: DataTypes.ENUM(
          {
            values: ['Member', 'Deleted']
          }),
        allowNull: false
      },
      picture: DataTypes.STRING
    },
    {
      tableName: 'customers',
      underscored: true
    })

  Customer.associate = models => {
    Customer.hasMany(models.Order,
      {

        foreignKey: {
          name: 'customerId',
          allowNull: false,
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      })
  }
  return Customer
}