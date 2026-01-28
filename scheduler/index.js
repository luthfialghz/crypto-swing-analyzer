const cron = require('node-cron');
const axios = require('axios');

// URL of the API endpoint to trigger
const API_URL = process.env.API_URL || 'http://app:3000/api/daily-scheduler';

console.log('Scheduler started...');
console.log(`Target API URL: ${API_URL}`);

// Schedule the task to run every day at 07:00 WIB (Asia/Jakarta)
// The TZ environment variable should be set to Asia/Jakarta in Docker
cron.schedule('0 7 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Triggering daily analysis...`);
    try {
        const response = await axios.get(API_URL);
        console.log(`[${new Date().toISOString()}] Success:`, response.data);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error triggering analysis:`, error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
});

// Optional: Ping on startup to verify connectivity
console.log('Running initial connectivity check...');
axios.get('http://app:3000/api/health')
    .then(() => console.log('Successfully connected to main application.'))
    .catch(err => console.warn('Main application not ready yet, but scheduler is running. Error:', err.message));
