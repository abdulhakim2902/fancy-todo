'use strict';
const moment = require('moment');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Todo.belongsTo(models.User, {foreignKey: 'user_id'})
    }
  };
  Todo.init({
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    description: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    due_date: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: true,
        isAfterDate(value) {
          let choosenDate = new Date(moment(`${value} 23:59:59`).format());
          let currentDate = new Date();

          if (choosenDate < currentDate) {
            throw new Error ('Validation Error')
          }
        }
      }
    },  
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Todo'
  });
  return Todo;
};