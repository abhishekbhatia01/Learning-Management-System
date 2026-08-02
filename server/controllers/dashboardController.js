import Course from "../model/Course.js";
import Enrollment from "../model/Enrollment.js";
import User from "../model/User.js";
import Review from "../model/Review.js";
import { fn, col, Op } from "sequelize";

// GET - Instructor analytics
// Returns: { courseCount, totalEnrolled (unique students), avgRating, revenue }
export const getInstructorAnalytics = async (req, res) => {
  try {
    const instructorId = req.user && req.user.id;
    if (!instructorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Find courses for instructor
    const courses = await Course.findAll({
      where: { instructorId },
      attributes: ["id", "price", "rating"],
    });

    const courseCount = courses.length;

    if (courseCount === 0) {
      return res.status(200).json({
        success: true,
        courseCount: 0,
        totalEnrolled: 0,
        avgRating: 0,
        revenue: 0,
      });
    }

    const courseIds = courses.map((c) => c.id);

    // Total unique enrolled students across instructor's courses
    const totalEnrolled = await Enrollment.count({
      distinct: true,
      col: "userId",
      where: { courseId: { [Op.in]: courseIds } },
    });

    // Average rating across instructor's courses (use course.rating field)
    const ratings = courses.map((c) =>
      typeof c.rating === "number" ? c.rating : 0
    );
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    // Fake revenue: sum of (course.price * numberOfEnrollmentsForThatCourse)
    const enrollmentAgg = await Enrollment.findAll({
      where: { courseId: { [Op.in]: courseIds } },
      attributes: ["courseId", [fn("COUNT", col("id")), "count"]],
      group: ["courseId"],
      raw: true,
    });

    // Map counts by course id string
    const countsByCourse = enrollmentAgg.reduce((acc, item) => {
      acc[String(item.courseId)] = parseInt(item.count, 10);
      return acc;
    }, {});

    let revenue = 0;
    for (const course of courses) {
      const cnt = countsByCourse[String(course.id)] || 0;
      const price = typeof course.price === "number" ? course.price : parseFloat(course.price || 0);
      revenue += price * cnt;
    }

    // Round avgRating to 2 decimals
    const roundedAvgRating =
      Math.round((avgRating + Number.EPSILON) * 100) / 100;

    res.status(200).json({
      success: true,
      courseCount,
      totalEnrolled,
      avgRating: roundedAvgRating,
      revenue,
    });
  } catch (error) {
    console.error("Get Instructor Analytics Error:", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error: ${error.message}` });
  }
};

// GET - Student analytics
// Returns: { enrolledCount, reviewCount, recentEnrolledCourses }
export const getStudentAnalytics = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Total enrolled courses count
    const enrolledCount = await Enrollment.count({ where: { userId } });

    // Total reviews by student
    const reviewCount = await Review.count({ where: { userId } });

    // Suggestion implemented: include recent enrolled courses (last 5)
    const recentEnrollments = await Enrollment.findAll({
      where: { userId },
      sort: [["enrolledDate", "DESC"]],
      limit: 5,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "thumbnail", "instructorId"],
          include: [{ model: User, as: "instructor", attributes: ["name"] }],
        },
      ],
    });

    const recentEnrolledCourses = recentEnrollments.map((e) => {
      const eJson = e.toJSON();
      return {
        courseId: eJson.course?.id,
        title: eJson.course?.title,
        thumbnail: eJson.course?.thumbnail,
        instructor: eJson.course?.instructor?.name,
        enrolledDate: eJson.enrolledDate,
      };
    });

    res.status(200).json({
      success: true,
      enrolledCount,
      reviewCount,
      recentEnrolledCourses,
    });
  } catch (error) {
    console.error("Get Student Analytics Error:", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error: ${error.message}` });
  }
};

// GET - Global analytics (admin)
// Returns: { totalUsers: { students, teachers, admins, total }, totalCourses, totalRevenue }
export const getGlobalAnalytics = async (req, res) => {
  try {
    const requester = req.user && req.user.id;
    if (!requester) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Users counts
    const studentsCount = await User.count({ where: { role: "student" } });
    const teachersCount = await User.count({ where: { role: "teacher" } });
    const adminsCount = await User.count({ where: { role: "admin" } });
    const totalUsers = studentsCount + teachersCount + adminsCount;

    // Courses count
    const totalCourses = await Course.count();

    // Revenue (fake): sum of (course.price * enrollments count)
    const courses = await Course.findAll({ attributes: ["id", "price"] });
    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        totalUsers: {
          students: studentsCount,
          teachers: teachersCount,
          admins: adminsCount,
          total: totalUsers,
        },
        totalCourses: 0,
        totalRevenue: 0,
      });
    }

    const enrollmentAgg = await Enrollment.findAll({
      where: { courseId: { [Op.in]: courseIds } },
      attributes: ["courseId", [fn("COUNT", col("id")), "count"]],
      group: ["courseId"],
      raw: true,
    });

    const countsByCourse = enrollmentAgg.reduce((acc, item) => {
      acc[String(item.courseId)] = parseInt(item.count, 10);
      return acc;
    }, {});

    let totalRevenue = 0;
    for (const course of courses) {
      const cnt = countsByCourse[String(course.id)] || 0;
      const price = typeof course.price === "number" ? course.price : parseFloat(course.price || 0);
      totalRevenue += price * cnt;
    }

    res.status(200).json({
      success: true,
      totalUsers: {
        students: studentsCount,
        teachers: teachersCount,
        admins: adminsCount,
        total: totalUsers,
      },
      totalCourses,
      totalRevenue,
    });
  } catch (error) {
    console.error("Get Global Analytics Error:", error);
    res
      .status(500)
      .json({ success: false, message: `Server Error: ${error.message}` });
  }
};
