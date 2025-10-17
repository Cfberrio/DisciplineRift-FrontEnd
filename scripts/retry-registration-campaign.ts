#!/usr/bin/env tsx

/**
 * Script para reenviar correos de registro solo a los que fallaron
 * 
 * Uso:
 *   npx tsx scripts/retry-registration-campaign.ts
 */

import { retryRegistrationEmails } from '../jobs/retryRegistrationEmail';

console.log('🔄 Starting RETRY Registration Email Campaign...\n');
console.log('This will send emails ONLY to recipients who did NOT receive it successfully before');
console.log('A 2-second delay between emails will prevent Gmail blocking\n');
console.log('='.repeat(60) + '\n');

retryRegistrationEmails()
  .then(() => {
    console.log('\n✅ Retry campaign completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Retry campaign failed:', error);
    process.exit(1);
  });






