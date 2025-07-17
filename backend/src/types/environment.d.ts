declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      PORT: string;
      JWT_SECRET: string;
      POSTGRES_URL: string;
      MONGODB_URI: string;
      OPENAI_API_KEY: string;
    }
  }
}
