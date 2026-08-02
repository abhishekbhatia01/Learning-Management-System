import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Lecture = sequelize.define(
  "Lecture",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["courseId", "order"],
      },
    ],
  }
);

export default Lecture;
