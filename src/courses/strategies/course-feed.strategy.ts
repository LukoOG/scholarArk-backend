import { FilterQuery } from "mongoose";
import { User } from "src/user/schemas/user.schema";
import { CourseFeedType } from "../dto/courses/course-filter.dto";
import { Course } from "../schemas/course.schema";


export type CourseFeedStrategy = (
  user: User,
) => FilterQuery<Course>;

export const COURSE_FEED_STRATEGIES: Record<
  CourseFeedType,
  CourseFeedStrategy
> = {
  [CourseFeedType.FEATURED]: () => ({
    isFeatured: true,
  }),

  [CourseFeedType.PERSONALIZED]: (user) => (user.topicsIds ? {
    topicsIds: { $in: user.topicsIds },
  } : { isFeatured: true }), //return featured courses

  [CourseFeedType.SIMILAR_TO_COMPLETED]: (user) => ({
    _id: { $nin: user.completedCourseIds },
    topicsIds: { $in: user.topicsIds },
  }),


  [CourseFeedType.BASED_ON_SUBSCRIPTIONS]: (user) => ({
    tutor: { $in: user.subscribedTutorIds },
  }),
};
