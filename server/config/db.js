import { sequelize } from "./database.js";
import User from "../model/User.js";
import Course from "../model/Course.js";
import Lecture from "../model/Lecture.js";
import Enrollment from "../model/Enrollment.js";
import Cart from "../model/Cart.js";
import CartItem from "../model/CartItem.js";
import Payment from "../model/Payment.js";
import PaymentCourses from "../model/PaymentCourses.js";
import Review from "../model/Review.js";

// User - Course (Instructor)
User.hasMany(Course, { foreignKey: "instructorId", as: "courses" });
Course.belongsTo(User, { foreignKey: "instructorId", as: "instructor" });

// Course - Lecture
Course.hasMany(Lecture, {
  foreignKey: "courseId",
  as: "lectures",
  onDelete: "CASCADE",
});
Lecture.belongsTo(Course, { foreignKey: "courseId", as: "course" });

// User - Enrollment
User.hasMany(Enrollment, { foreignKey: "userId", onDelete: "CASCADE" });
Enrollment.belongsTo(User, { foreignKey: "userId", as: "user" });

// Course - Enrollment
Course.hasMany(Enrollment, { foreignKey: "courseId", onDelete: "CASCADE" });
Enrollment.belongsTo(Course, { foreignKey: "courseId", as: "course" });

// User - Review
User.hasMany(Review, { foreignKey: "userId", onDelete: "CASCADE" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });

// Course - Review
Course.hasMany(Review, { foreignKey: "courseId", onDelete: "CASCADE" });
Review.belongsTo(Course, { foreignKey: "courseId", as: "course" });

// User - Cart
User.hasOne(Cart, { foreignKey: "userId", onDelete: "CASCADE" });
Cart.belongsTo(User, { foreignKey: "userId", as: "user" });

// Cart - CartItem
Cart.hasMany(CartItem, {
  foreignKey: "cartId",
  as: "items",
  onDelete: "CASCADE",
});
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

// Course - CartItem
Course.hasMany(CartItem, { foreignKey: "courseId", onDelete: "CASCADE" });
CartItem.belongsTo(Course, { foreignKey: "courseId", as: "course" });

// User - Payment
User.hasMany(Payment, { foreignKey: "userId", onDelete: "CASCADE" });
Payment.belongsTo(User, { foreignKey: "userId", as: "user" });

// Payment - Course (Many-to-Many via PaymentCourses)
Payment.belongsToMany(Course, {
  through: PaymentCourses,
  as: "courses",
  foreignKey: "paymentId",
});
Course.belongsToMany(Payment, {
  through: PaymentCourses,
  foreignKey: "courseId",
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Connected (via Sequelize)");

    const shouldAlter = process.env.DB_SYNC_ALTER === "true";
    const shouldForce = process.env.DB_SYNC_FORCE === "true";
    const syncOptions = {};

    if (shouldAlter) syncOptions.alter = true;
    if (shouldForce) syncOptions.force = true;

    try {
      await sequelize.sync(syncOptions);
    } catch (syncError) {
      const isDeadlock =
        syncError?.original?.code === "ER_LOCK_DEADLOCK" ||
        syncError?.parent?.code === "ER_LOCK_DEADLOCK";

      if (isDeadlock && shouldAlter) {
        console.warn(
          "⚠️ DB schema alter hit a deadlock. Falling back to safe sync without alter.",
        );
        await sequelize.sync();
      } else {
        throw syncError;
      }
    }

    console.log("✅ Database Models Synced");
  } catch (error) {
    console.error("❌ Database Connection/Sync Error:", error);
    process.exit(1);
  }
};
export { sequelize };
