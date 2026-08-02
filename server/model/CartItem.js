import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    _id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.id;
      },
    },
  },
  {
    timestamps: true,
  }
);

export default CartItem;
