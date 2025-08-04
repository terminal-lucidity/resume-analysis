import { postgresConnection } from "../config/database";
import { JobRecommendationService } from "../services/jobRecommendations";
import { User } from "../entities/User";

async function testRecommendations() {
  try {
    await postgresConnection.initialize();
    console.log("Connected to database");

    // Get a test user (you'll need to replace with an actual user ID)
    const testUserId = "your-test-user-id"; // Replace with actual user ID

    console.log("Testing job recommendations...");
    const recommendations = await JobRecommendationService.getRecommendations(
      testUserId,
      10
    );

    console.log(`\nFound ${recommendations.length} recommendations:`);
    recommendations.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.company.name}`);
      console.log(`   Level: ${job.level}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Remote: ${job.remote ? "Yes" : "No"}`);
      console.log(`   Skills: ${job.skills?.join(", ") || "None"}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error testing recommendations:", error);
    process.exit(1);
  }
}

testRecommendations();
