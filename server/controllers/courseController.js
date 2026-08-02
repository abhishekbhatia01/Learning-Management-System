import Course from "../model/Course.js";
import { paginate } from "../utils/paginate.js";
import { imagekit } from "../config/imagekit.js";
import Lecture from "../model/Lecture.js";
import Enrollment from "../model/Enrollment.js";
import User from "../model/User.js";
import { Op } from "sequelize";

// GET - public
export const getAllCourses = async (req, res) => {
  try {
    const { page, limit, category, search } = req.query;
    let query = {};

    if (category && category.trim() !== "") {
      query.category = category.trim();
    }

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      query[Op.or] = [
        { title: { [Op.like]: searchPattern } },
        { category: { [Op.like]: searchPattern } },
      ];
    }

    if (category && category.trim() !== "" && search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      query = {
        category: category.trim(),
        [Op.or]: [
          { title: { [Op.like]: searchPattern } },
          { category: { [Op.like]: searchPattern } },
        ],
      };
    }

    const data = await paginate(Course, query, {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-description",
      populate: {
        path: "instructor",
        select: "name", // Return only name instead of password etc.
      },
    });

    // Make sure we serialize rows to JSON to include virtual fields
    if (data.result) {
      data.result = data.result.map((item) => item.toJSON());
    }

    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("Course Error: ", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error: ${error.message}` });
  }
};

// GET - public
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: {
        model: User,
        as: "instructor",
        attributes: ["name"],
      },
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, course: course.toJSON() });
  } catch (error) {
    console.error("Course Error: ", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error: ${error.message}` });
  }
};

// POST - instructor
export const createCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, price, thumbnail, category } = req.body;

    if (!title || !description || !price || !category) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existing = await Course.findOne({
      where: {
        title: title.trim(),
        instructorId: userId,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a course with this title.",
      });
    }

    const newCourse = await Course.create({
      title,
      description,
      price,
      thumbnail,
      category,
      instructorId: userId,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: newCourse.toJSON(),
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "You already created a course with this title",
      });
    }
    console.error("Create Course Error : ", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error: ${error.message}` });
  }
};

// PUT - instructor
export const updateCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, price, thumbnail, category } = req.body;

    if (!title && !description && !price && !thumbnail && !category) {
      return res
        .status(400)
        .json({ success: false, message: "At least one field is required" });
    }

    const existing = await Course.findOne({
      where: { id, instructorId: userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Course not found or the course is not yours",
      });
    }

    existing.title = title ?? existing.title;
    existing.description = description ?? existing.description;
    existing.price = price ?? existing.price;
    existing.thumbnail = thumbnail ?? existing.thumbnail;
    existing.category = category ?? existing.category;
    await existing.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: existing.toJSON(),
    });
  } catch (error) {
    console.error("Update Course Error : ", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error: ${error.message}` });
  }
};

// DELETE - instructor/Admin
export const deleteCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = req.params;

    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (course.instructorId !== userId && userRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this course",
      });
    }

    const lectures = await Lecture.findAll({ where: { courseId: id } });

    for (const lec of lectures) {
      try {
        await imagekit.deleteFile(lec.fileId);
      } catch (error) {
        console.error(`Failed to delete ${lec.fileId}`, error.message);
      }
    }
    await Lecture.destroy({ where: { courseId: id } });

    await course.destroy();
    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete Course Error : ", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error: ${error.message}` });
  }
};

// GET - instructor
export const getInstructorCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit } = req.query;
    const data = await paginate(
      Course,
      { instructorId: userId },
      { page, limit, sort: { createdAt: -1 } }
    );

    if (data.result) {
      data.result = data.result.map((item) => item.toJSON());
    }

    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("Get Instructor Courses Error : ", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error: ${error.message}` });
  }
};

// GET - instructor
export const getSignature = async (req, res) => {
  try {
    const authParam = await imagekit.getAuthenticationParameters();
    res.status(200).json({ success: true, authParam });
  } catch (error) {
    console.error("Get Signature Error : ", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error: ${error.message}` });
  }
};

// GET - Check if user is enrolled in a course or is the instructor
export const verifyEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      where: {
        userId,
        courseId,
      },
    });

    // Check if user is the instructor of the course
    const course = await Course.findByPk(courseId);
    const isInstructor = course && course.instructorId === userId;

    res.status(200).json({
      success: true,
      isEnrolled: !!enrollment || isInstructor,
    });
  } catch (error) {
    console.error("Verify Enrollment Error : ", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error: ${error.message}` });
  }
};
