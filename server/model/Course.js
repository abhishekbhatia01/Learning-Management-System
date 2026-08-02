import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Course = sequelize.define(
  "Course",
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    thumbnail: {
      type: DataTypes.STRING,
      defaultValue:
        "https://newsroundtheclock.com/wp-content/uploads/2023/10/online-course-blog-header.jpg",
    },
    numberOfReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["title", "instructorId"],
      },
    ],
  }
);

export default Course;
