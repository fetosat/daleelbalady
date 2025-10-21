import PaymobService from './services/paymob.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testPaymobConfiguration() {
  console.log('🚀 Starting Paymob configuration test...\n');
  
  try {
    // Create Paymob service instance
    const paymobService = new PaymobService();
    
    // Test authentication
    const result = await paymobService.testConnection();
    
    if (result.success) {
      console.log('\n🎉 Paymob configuration test completed successfully!');
      console.log('✅ Authentication token received:', result.token);
    } else {
      console.log('\n❌ Paymob configuration test failed!');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.log('\n💥 Paymob configuration test error:');
    console.error(error.message);
    
    if (error.message.includes('Missing Paymob configuration')) {
      console.log('\n💡 Make sure these environment variables are set in .env:');
      console.log('   - PAYMOB_API_KEY');
      console.log('   - PAYMOB_INTEGRATION_ID');
      console.log('   - PAYMOB_IFRAME_ID');
      console.log('   - PAYMOB_WEBHOOK_SECRET');
    }
  }
  
  process.exit(0);
}

testPaymobConfiguration();
