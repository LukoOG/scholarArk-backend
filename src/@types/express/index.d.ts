import { User } from '../../users/schemas/user.schema';
import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: Types.ObjectId;
        role: string;
        email?: string;
      };
    }
  }
}

//not yet included in tsconfig