// courses.mapper.ts
import { CourseListItem } from "../schemas/course.schema";

export function sanitizeCourseListItem(course: any): CourseListItem {
  const {
    thumbnail,
    topicIds,
    __v,
    tutor,
    ...rest
  } = course;

  return {
    ...rest,

    tutor: tutor
      ? {
          _id: tutor._id,
          first_name: tutor.first_name,
          last_name: tutor.last_name,
          email: tutor.email,
          profilePicUrl: tutor.profilePicUrl
        }
      : null,
  };
}
