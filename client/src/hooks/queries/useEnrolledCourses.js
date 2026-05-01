import { useQuery } from "@tanstack/react-query";
import { enrolledCourseApi } from "../../api/userApi";

export const useEnrolledCourses = () => {
  return useQuery({
    queryKey: ["enrolled-courses"],
    queryFn: enrolledCourseApi,
    staleTime: 0, // Always fetch fresh — so newly purchased courses appear immediately
  });
};
