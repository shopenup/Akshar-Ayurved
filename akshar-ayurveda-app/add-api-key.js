/**
 * Simple script to add the publishable API key to your database
 * Run this from your backend directory (shopenup/)
 */

const { PrismaClient } = require('@prisma/client');

async function addPublishableApiKey() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔑 Adding publishable API key to database...');
    
    // Check if the key already exists
    const existingKey = await prisma.apiKey.findFirst({
      where: {
        token: 'pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f'
      }
    });
    
    if (existingKey) {
      console.log('✅ API key already exists in database');
      console.log('Key details:', {
        id: existingKey.id,
        title: existingKey.title,
        type: existingKey.type,
        token: existingKey.token
      });
      return;
    }
    
    // Create the API key
    const apiKey = await prisma.apiKey.create({
      data: {
        token: 'pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f',
        type: 'PUBLISHABLE',
        title: 'Frontend Publishable Key',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    
    console.log('✅ Publishable API key created successfully!');
    console.log('Key details:', {
      id: apiKey.id,
      title: apiKey.title,
      type: apiKey.type,
      token: apiKey.token
    });
    
  } catch (error) {
    console.error('❌ Error creating API key:', error);
    
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

// Run the function
if (require.main === module) {
  addPublishableApiKey().catch(console.error);
}

module.exports = { addPublishableApiKey };

