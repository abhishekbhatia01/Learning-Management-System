import { fn, col } from "sequelize";
import Review from "../model/Review.js";
import Course from "../model/Course.js";

export const updateCourseRating = async (courseId) => {
  try {
    const stats = await Review.findOne({
      where: { courseId },
      attributes: [
        [fn("AVG", col("rating")), "avgRating"],
        [fn("COUNT", col("id")), "count"],
      ],
      raw: true,
    });

    const count = stats && stats.count ? parseInt(stats.count, 10) : 0;
    const avgRating = stats && stats.avgRating ? parseFloat(stats.avgRating) : 0;

    const course = await Course.findByPk(courseId);
    if (course) {
      course.rating = Math.round(avgRating * 100) / 100; // Round to 2 decimal places
      course.numberOfReviews = count;
      await course.save();
    }
  } catch (error) {
    console.error("Error updating course rating:", error);
  }
};
