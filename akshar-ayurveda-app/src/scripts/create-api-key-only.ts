import { createApiKeysWorkflow } from '@shopenup/shopenup/core-flows';
import { ExecArgs } from '@shopenup/framework/types';

export default async function createApiKeyOnly({ container }: ExecArgs) {
  const logger = container.resolve('logger');
  
  try {
    logger.info('🔑 Creating publishable API key...');
    
    const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
      container,
    ).run({
      input: {
        api_keys: [
          {
            title: 'Frontend Publishable Key',
            type: 'publishable',
            created_by: '',
            token: 'pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f',
          },
        ],
      },
    });
    
    const publishableApiKey = publishableApiKeyResult[0];
    
    logger.info('✅ Publishable API key created successfully!');
    logger.info(`Key ID: ${publishableApiKey.id}`);
    logger.info(`Key Title: ${publishableApiKey.title}`);
    logger.info(`Key Type: ${publishableApiKey.type}`);
    logger.info(`Key Token: ${publishableApiKey.token}`);
    
    return publishableApiKey;
    
  } catch (error) {
    logger.error('❌ Error creating API key:', error);
    
    if (error.message?.includes('already exists')) {
      logger.info('ℹ️  API key already exists, checking database...');
      // You can add logic here to check if the key exists
    }
    
    throw error;
  }
}

