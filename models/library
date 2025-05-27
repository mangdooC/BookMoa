module.exports = (sequelize, Sequelize) => {
  class Library extends Sequelize.Model { }

  Library.init({
    LibraryId: { //도서관번호
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    LibraryName: {//도서관명
      type: Sequelize.STRING,
      allowNull: false
     }, 
    Address: {//주소
      type: Sequelize.VARCHAR,
      allowNull: false
    }, 
    latitude: {//위도
      type: Sequelize.Decimal ,
      allowNull: true
    },
    longtitude: {//경도
      type: Sequelize.Decimal ,
      allowNull: true
    },

  },
    {
      sequelize,
      modelName: 'Library',
      timestamps: false
    });

  return Library;
};
