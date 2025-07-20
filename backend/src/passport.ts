import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { postgresConnection } from "./config/database";
import { User } from "./entities/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const userRepository = postgresConnection.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy - only initialize if environment variables are present
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
      ) => {
        try {
          const userRepository = postgresConnection.getRepository(User);
          let user = await userRepository.findOne({
            where: { googleId: profile.id },
          });
          if (!user) {
            // Try to find by email
            const email = profile.emails?.[0]?.value;
            if (email) {
              user = await userRepository.findOne({ where: { email } });
            }
            if (!user) {
              user = userRepository.create({
                googleId: profile.id,
                email: email || `google_${profile.id}@noemail.com`,
                name: profile.displayName,
              });
            } else {
              user.googleId = profile.id;
            }
            await userRepository.save(user);
          }
          return done(null, user);
        } catch (err) {
          return done(err, undefined);
        }
      }
    )
  );
  console.log("Google OAuth strategy initialized");
} else {
  console.log(
    "Google OAuth environment variables not found - Google OAuth disabled"
  );
}

// GitHub OAuth Strategy - only initialize if environment variables are present
if (
  process.env.GITHUB_CLIENT_ID &&
  process.env.GITHUB_CLIENT_SECRET &&
  process.env.GITHUB_CALLBACK_URL
) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ["user:email"],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
      ) => {
        try {
          const userRepository = postgresConnection.getRepository(User);
          let user = await userRepository.findOne({
            where: { githubId: profile.id },
          });
          if (!user) {
            // Try to find by email
            let email = profile.emails?.[0]?.value;
            if (!email && profile._json?.email) {
              email = profile._json.email;
            }
            if (email) {
              user = await userRepository.findOne({ where: { email } });
            }
            if (!user) {
              user = userRepository.create({
                githubId: profile.id,
                email: email || `github_${profile.id}@noemail.com`,
                name: profile.displayName || profile.username,
              });
            } else {
              user.githubId = profile.id;
            }
            await userRepository.save(user);
          }
          return done(null, user);
        } catch (err) {
          return done(err, undefined);
        }
      }
    )
  );
  console.log("GitHub OAuth strategy initialized");
} else {
  console.log(
    "GitHub OAuth environment variables not found - GitHub OAuth disabled"
  );
}

export default passport;
