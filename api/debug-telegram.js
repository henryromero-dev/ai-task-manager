require('dotenv').config();
const axios = require('axios');

async function debugTelegram() {
    console.log('🔍 Debugging Telegram configuration...\n');
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    console.log('Configuration:');
    console.log(`Bot Token: ${botToken ? botToken.substring(0, 10) + '...' : 'NOT SET'}`);
    console.log(`Chat ID: ${chatId || 'NOT SET'}`);
    console.log(`Chat ID type: ${typeof chatId}`);
    console.log('');
    
    if (!botToken || !chatId) {
        console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
        return;
    }
    
    // Test 1: Check bot info
    console.log('📋 Test 1: Getting bot info...');
    try {
        const botInfoUrl = `https://api.telegram.org/bot${botToken}/getMe`;
        const botResponse = await axios.get(botInfoUrl);
        console.log('✅ Bot info:', botResponse.data.result.username);
    } catch (error) {
        console.error('❌ Bot token invalid:', error.response?.data || error.message);
        return;
    }
    
    // Test 2: Send simple message
    console.log('📨 Test 2: Sending simple message...');
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const payload = {
            chat_id: chatId,
            text: 'Simple test message'
        };
        
        console.log('Request payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post(url, payload);
        console.log('✅ Simple message sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send simple message:');
        console.error('Status:', error.response?.status);
        console.error('Response:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test 3: Send markdown message
    console.log('📨 Test 3: Sending markdown message...');
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const payload = {
            chat_id: chatId,
            text: '*Bold text* and _italic text_',
            parse_mode: 'Markdown'
        };
        
        const response = await axios.post(url, payload);
        console.log('✅ Markdown message sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send markdown message:');
        console.error('Status:', error.response?.status);
        console.error('Response:', JSON.stringify(error.response?.data, null, 2));
    }
    
    // Test 4: Get chat info
    console.log('💬 Test 4: Getting chat info...');
    try {
        const url = `https://api.telegram.org/bot${botToken}/getChat`;
        const response = await axios.post(url, { chat_id: chatId });
        console.log('✅ Chat info:', {
            id: response.data.result.id,
            type: response.data.result.type,
            title: response.data.result.title || response.data.result.first_name
        });
    } catch (error) {
        console.error('❌ Failed to get chat info:');
        console.error('Status:', error.response?.status);
        console.error('Response:', JSON.stringify(error.response?.data, null, 2));
        console.log('💡 This might mean you need to send a message to the bot first');
    }
}

debugTelegram();