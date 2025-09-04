/**
 * Comprehensive script to fix the publishable API key issue
 * This script will:
 * 1. Create the API key in the database
 * 2. Link it to your sales channel
 * 3. Ensure it's properly configured
 */

const { PrismaClient } = require('@prisma/client');

async function fixPublishableApiKey() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔑 Fixing publishable API key issue...');
    
    // Step 1: Check if the key already exists
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        token: 'pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f'
      },
      include: {
        sales_channels_link: true
      }
    });
    
    if (existingKey) {
      console.log('✅ API key already exists in database');
      console.log('Key details:', {
        id: existingKey.id,
        title: existingKey.title,
        type: existingKey.type,
        token: existingKey.token,
        salesChannels: existingKey.sales_channels_link.length
      });
      
      // Check if it's linked to sales channels
      if (existingKey.sales_channels_link.length === 0) {
        console.log('⚠️  API key exists but not linked to sales channels');
        console.log('This is likely why your requests are being rejected');
        console.log('You need to link this key to your sales channel');
      } else {
        console.log('✅ API key is properly linked to sales channels');
        return;
      }
    }
    
    // Step 2: Get or create a sales channel
    let salesChannel = await prisma.salesChannel.findFirst({
      where: {
        name: 'Default Sales Channel'
      }
    });
    
    if (!salesChannel) {
      console.log('⚠️  No sales channel found, creating one...');
      salesChannel = await prisma.salesChannel.create({
        data: {
          name: 'Default Sales Channel',
          description: 'Default sales channel for the store',
          is_disabled: false
        }
      });
      console.log('✅ Created sales channel:', salesChannel.id);
    } else {
      console.log('✅ Found sales channel:', salesChannel.id);
    }
    
    // Step 3: Create the API key if it doesn't exist
    let apiKey;
    if (!existingKey) {
      console.log('📝 Creating new API key...');
      apiKey = await prisma.apiKey.create({
        data: {
          token: 'pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f',
          type: 'PUBLISHABLE',
          title: 'Frontend Publishable Key',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log('✅ API key created:', apiKey.id);
    } else {
      apiKey = existingKey;
      console.log('📝 Using existing API key:', apiKey.id);
    }
    
    // Step 4: Link API key to sales channel
    const existingLink = await prisma.apiKeySalesChannelLink.findFirst({
      where: {
        api_key_id: apiKey.id,
        sales_channel_id: salesChannel.id
      }
    });
    
    if (!existingLink) {
      console.log('🔗 Linking API key to sales channel...');
      await prisma.apiKeySalesChannelLink.create({
        data: {
          api_key_id: apiKey.id,
          sales_channel_id: salesChannel.id
        }
      });
      console.log('✅ API key linked to sales channel');
    } else {
      console.log('✅ API key already linked to sales channel');
    }
    
    // Step 5: Verify the setup
    const finalKey = await prisma.apiKey.findFirst({
      where: {
        id: apiKey.id
      },
      include: {
        sales_channels_link: {
          include: {
            sales_channel: true
          }
        }
      }
    });
    
    console.log('\n🎉 API Key Setup Complete!');
    console.log('Key ID:', finalKey.id);
    console.log('Token:', finalKey.token);
    console.log('Type:', finalKey.type);
    console.log('Linked to sales channels:', finalKey.sales_channels_link.length);
    
    finalKey.sales_channels_link.forEach(link => {
      console.log(`  - ${link.sales_channel.name} (${link.sales_channel.id})`);
    });
    
    console.log('\n✅ Your frontend should now be able to connect to the backend!');
    console.log('Try placing an order to test the SMS integration.');
    
  } catch (error) {
    console.error('❌ Error fixing API key:', error);
    
    if (error.code === 'P2002') {
      console.log('ℹ️  API key already exists (duplicate constraint)');
    } else if (error.message?.includes('Unknown column')) {
      console.log('ℹ️  Database schema might be different');
      console.log('Try running the seed script instead: npm run seed');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative: Manual SQL commands if Prisma fails
function showManualSQL() {
  console.log(`
  🔧 Manual SQL Alternative:
  
  If the script fails, run these SQL commands in your database:
  
  1. Create the API key:
  INSERT INTO api_key (id, token, type, title, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f',
    'publishable',
    'Frontend Publishable Key',
    NOW(),
    NOW()
  );
  
  2. Get your sales channel ID:
  SELECT id, name FROM sales_channel;
  
  3. Link the API key to sales channel (replace UUIDs):
  INSERT INTO api_key_sales_channel_link (api_key_id, sales_channel_id)
  VALUES ('API_KEY_UUID', 'SALES_CHANNEL_UUID');
  
  Note: You may need to adjust table names based on your schema.
  `);
}

// Run the function
if (require.main === module) {
  fixPublishableApiKey().catch(console.error);
  showManualSQL();
}

module.exports = { fixPublishableApiKey };
