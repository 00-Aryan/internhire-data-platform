CRON_SECRET=your_super_secure_random_string_here

# Example: Run every day at midnight
0 0 * * * curl -X POST http://localhost:3000/api/score -H "Authorization: Bearer your_super_secure_random_string_here"

# to test the pipeline call manually or trigger the pipeline manually 
curl -X POST http://localhost:7040/api/score -H "Authorization: Bearer d8ea2c61eb230415ec6096b06101776d5aa2249c8111bd72bd1bff7b47cf9e17"

0 2 * * * /usr/bin/curl -X POST http://localhost:7040/api/score -H "Authorization: Bearer d8ea2c61eb230415ec6096b06101776d5aa2249c8111bd72bd1bff7b47cf9e17" >> /var/www/internscore/current/logs/cron_score.log 2>&1


npx 


