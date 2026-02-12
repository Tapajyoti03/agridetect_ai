import { checkHealth, predictDisease } from './src/lib/api.js';

async function testConnection() {
    console.log('Testing API connection...');
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const health = await checkHealth();
        console.log('✅ Health check passed:', health);
        
        // Test prediction endpoint with dummy data
        console.log('2. Testing prediction endpoint...');
        const dummyFile = new Blob(['test'], { type: 'image/jpeg' });
        const file = new File([dummyFile], 'test.jpg', { type: 'image/jpeg' });
        
        const prediction = await predictDisease(file);
        console.log('✅ Prediction endpoint working:', prediction);
        
    } catch (error) {
        console.error('❌ API connection failed:', error.message);
        console.error('Full error:', error);
    }
}

testConnection();