// API SERVER STATUS
// If the main API server is experiencing issues, you can switch to a backup server by
// uncommenting the alternate server URL below and commenting out the main server URL.

// Main production server
//export const BASE_URL = "https://karmickeran.com/api/v1";

// Backup server - uncomment if the main server is down
// export const BASE_URL = "https://backup-api.karmickeran.com/api/v1";

// For local development:
 export const BASE_URL = "https://4cb3-103-66-50-227.ngrok-free.app/api/v1"; 

// Debug API endpoint status
console.log(`API Endpoint configured: ${BASE_URL}`);

// Verify API connectivity on startup
(async () => {
  try {
    const response = await fetch(`${BASE_URL}/health-check`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('API server is reachable ✅');
    } else {
      console.warn(`API server returned status: ${response.status} ⚠️`);
    }
  } catch (error) {
    console.error(`API server connectivity issue: ${error.message} ❌`);
    console.warn('If the API server is down, check the base_url.js file to switch to a backup server.');
  }
})(); 