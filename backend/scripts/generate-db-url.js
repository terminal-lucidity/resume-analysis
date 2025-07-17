const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error("Usage: node generate-db-url.js <username> <password>");
  process.exit(1);
}

// URL encode the username and password
const encodedUsername = encodeURIComponent(username);
const encodedPassword = encodeURIComponent(password);

const url = `postgresql://${encodedUsername}:${encodedPassword}@localhost:5432/resume_analysis`;
console.log("\nCopy this URL into your .env file:\n");
console.log(`POSTGRES_URL=${url}\n`);
