// Simple test script for SMS API
const testSMS = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+917801806153',
        template: 'order-confirmation-sms',
        data: {
          order_id: 'TEST123',
          customer_name: 'Test Customer',
          total_amount: 1500,
          currency: 'INR'
        }
      }),
    });

    const result = await response.json();
    console.log('SMS API Response:', result);
    
    if (result.success) {
      console.log('✅ SMS API is working!');
    } else {
      console.log('❌ SMS API failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error testing SMS API:', error);
  }
};

// Run test if this script is executed directly
if (typeof window === 'undefined') {
  testSMS();
}
