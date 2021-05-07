module.exports = (sequelize, DataTypes) => {
  const Supplier = sequelize.define('Supplier',
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      address: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM(
          {
            values: ['Trade', 'Not trade']
          }),
        allowNull: false
      }
    },
    {
      tableName: 'suppliers',
      timestamps: false,
      underscored: true
    }
  )
  Supplier.association = models => {
    Supplier.hasMany(models.Product,
      {

        foreignKey: {
          name: 'supplierId',
          allowNull: false,
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      })
  }
  return Supplier
}