require('dotenv').config();
const notificationService = require('./services/notificationService');

async function testTelegram() {
    console.log('Testing Telegram notification...');
    
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
        console.error('❌ TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in .env');
        process.exit(1);
    }
    
    console.log(`Bot Token: ${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
    console.log(`Chat ID: ${process.env.TELEGRAM_CHAT_ID}`);
    
    try {
        const result = await notificationService.sendTelegram('🧪 *Test Message*\n\nThis is a test from your task management API!\n\n_If you see this, Telegram notifications are working correctly._');
        
        if (result.success) {
            console.log('✅ Telegram message sent successfully!');
            console.log('Check your Telegram for the test message.');
        } else {
            console.error('❌ Failed to send message:', result.error);
        }
    } catch (error) {
        console.error('❌ Error testing Telegram:', error.message);
    }
}

testTelegram();