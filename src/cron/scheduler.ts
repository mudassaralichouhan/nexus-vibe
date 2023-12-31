import cron from 'node-cron'

function logMessage() {
  console.log('Cron job executed at:', new Date().toLocaleString());
}

cron.schedule('* * * * *', async () => {
  logMessage();
});