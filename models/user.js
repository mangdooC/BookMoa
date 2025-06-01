module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,  // 로그인 아이디라면 중복 안되게
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferred_lat: {  // 선호지역 위도 (필요하면 추가)
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    preferred_lng: {  // 선호지역 경도 (필요하면 추가)
      type: DataTypes.DOUBLE,
      allowNull: true,
    }
  }, {
    timestamps: false,
    freezeTableName: true, // 테이블명 복수형 자동 변환 방지
  });

  return User;
};
