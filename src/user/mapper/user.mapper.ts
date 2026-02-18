import { UserListItem } from "../schemas/user.schema";

export function sanitizeUserListItem(user: any): UserListItem {
    const {
        profile_pic,
        ...rest
    } = user;

    return {
        ...rest
    }
}