import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Enrollment = sequelize.define(
  "Enrollment",
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
    enrolledDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
  }
);

export default Enrollment;
