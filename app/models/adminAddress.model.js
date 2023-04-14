// This Sequelize Model represents tbl_users table in MySQL database. 
// These columns will be generated automatically: 
// id, title, description, published, createdAt, updatedAt.

// https://sequelize.org/docs/v6/core-concepts/model-basics/

module.exports = (sequelize, Sequelize) => {
    const DataTypes = Sequelize.DataTypes;
    const adminAddress = sequelize.define("adminAddress", {
      name: { //street name/building name etc
        type: DataTypes.STRING,
        allowNull: false
      },
      floorNo: {
        type: DataTypes.STRING
      },
      unitNo: {
        type: DataTypes.STRING
      },
      postalCode: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      country: {
        type: DataTypes.STRING,
        defaultValue: 'SINGAPORE'
      }
      ,userId: {
        type: DataTypes.STRING
      }
    }
    // include the following if want to specify the DB table name
    , {
        tableName: 'tbl_admin_address'
      }
    );
    
    return adminAddress;
  };