import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Payment = sequelize.define(
  "Payment",
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: "inr",
    },
    stripeSessionId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    stripePaymentIntentId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
      defaultValue: "pending",
    },
    paymentMethod: {
      type: DataTypes.ENUM("card", "upi", "netbanking", "wallet"),
      allowNull: true,
    },
    failureReason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    stripeEventIds: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ["userId", "createdAt"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

export default Payment;
