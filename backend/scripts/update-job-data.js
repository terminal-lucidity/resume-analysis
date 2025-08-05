const { JobDataService } = require("../dist/services/jobDataService");
const { postgresConnection } = require("../dist/config/database");

async function updateJobData() {
  try {
    console.log('🔄 Starting job data update...');
    
    // Initialize database connection
    await postgresConnection.initialize();
    console.log('✅ Database connected');
    
    // Update job data
    await JobDataService.initializeJobData();
    
    console.log('✅ Job data update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating job data:', error);
    process.exit(1);
  }
}

// Run the update
updateJobData(); 