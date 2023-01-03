'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class recipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.recipe.belongsTo(models.user)
      models.recipe.belongsToMany(models.ingredient, {through: "recipes_ingredients"})
    }
  }
  recipe.init({
    userId: DataTypes.INTEGER,
    recipe_name: DataTypes.STRING,
    cook_time: DataTypes.STRING,
    servings: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    ingredient_list: DataTypes.TEXT,
    quantities: DataTypes.TEXT,
    instructions: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'recipe',
  });
  return recipe;
};