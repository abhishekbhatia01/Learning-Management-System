import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const PaymentCourses = sequelize.define(
  "PaymentCourses",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    timestamps: false,
  }
);

export default PaymentCourses;
