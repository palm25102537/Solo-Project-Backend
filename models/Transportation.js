module.exports = (sequelize, DataTypes) => {
  const Transport = sequelize.define("Transport", {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    status: {
      type: DataTypes.ENUM(
        {
          values: [`Use`, `Not use`]
        }),
      allowNull: false
    }
  }, {
    tableName: 'transports',
    timestamps: false
  })

  Transport.associate = models => {
    Transport.hasMany(models.Order,
      {
        as: `transport_id`,
        foreignKey: {
          name: `transportId`,
          allowNull: false
        },
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT'
      })
  }

  return Transport
}