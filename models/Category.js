module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category',
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true }
    },
    {
      tableName: 'categories', underscored: true, timestamps: false
    })
  Category.associate = models => {
    Category.hasOne(models.Product,
      {
        foreignKey: {
          name: 'categoryId',
          allowNull: false
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      })
  }
  return Category
}