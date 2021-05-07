module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    price: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    description: DataTypes.STRING,
    picture: { type: DataTypes.STRING, validate: { isUrl: true }, unique: true },
    amount: { type: DataTypes.INTEGER, allowNull: false, defaulValue: '0' },
    status: {
      type: DataTypes.ENUM({
        values: [`Avaliable`, `Not Avaliable`]
      })
    },
    promotion: {
      type: DataTypes.ENUM({
        values: [`Promotion`, `No Promotion`]
      })
    }
  }, {
    tableName: 'products',
    timestamps: false,
    underscored: true
  })
  Product.associate = models => {
    Product.belongsTo(models.Supplier,
      {

        foreignKey: {
          name: 'supplierId',
          allowNull: false
        },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT'
      })

    Product.hasMany(models.OrderItem,
      {

        foreignKey:
        {
          name: 'productId',
          allowNull: false
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      })
    Product.belongsTo(models.Category,
      {
        foreignKey: {
          name: 'categoryId',
          allowNull: false
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      })
  }
  return Product;
}