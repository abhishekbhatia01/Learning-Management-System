import { sequelize } from "./config/database.js";
import User from "./model/User.js";
import "dotenv/config";

const seedAdmin = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log("⚡ Connected to MySQL database");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@learnify.in";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "System Admin";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log(`ℹ️ Admin user with email "${adminEmail}" already exists.`);
      process.exit(0);
    }

    // Create the admin user
    // The beforeSave hook in User.js will automatically hash the password
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    console.log(`✅ Admin user seeded successfully!`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding admin user failed:", error);
    process.exit(1);
  }
};

seedAdmin();
