import { User } from "../entities/User";

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
