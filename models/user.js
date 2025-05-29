module.exports = (sequelize, Sequelize) => {
  class User extends Sequelize.Model {}

  User.init({
    UserId: { // 사용자 ID (PK)
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: { // 아이디
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    nickname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: false,
  });

  return User;
};