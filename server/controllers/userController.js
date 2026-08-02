import User from "../model/User.js";
import Enrollment from "../model/Enrollment.js";
import Course from "../model/Course.js";
import { paginate } from "../utils/paginate.js";

// GET - Admin
export const getAllUsers = async (req, res) => {
  try {
    const { page, limit, role } = req.query;

    const query = role ? { role } : {};

    const data = await paginate(User, query, {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-password",
    });

    res.status(200).json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE - Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await User.destroy({ where: { id } });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET - Any user
export const profile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userDetails = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!userDetails) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: userDetails.toJSON() });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT - Any user
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const userId = req.user?.id;
    const updatedName = req.body.name || user.name;
    const updatedEmail = req.body.email || user.email;

    await User.update(
      { name: updatedName, email: updatedEmail },
      { where: { id: userId } }
    );

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser.toJSON(),
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET - Teacher/Students
export const enrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const enrolls = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "category", "thumbnail", "instructorId", "rating", "price"],
          include: [
            {
              model: User,
              as: "instructor",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["enrolledDate", "DESC"]],
    });

    const enrolledCourses = enrolls.map((e) => e.toJSON());

    res.status(200).json({
      success: true,
      totalEnrolled: enrolledCourses.length,
      enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
