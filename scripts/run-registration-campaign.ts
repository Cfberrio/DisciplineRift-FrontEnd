#!/usr/bin/env tsx

/**
 * Script para ejecutar la campaña de correos de registro
 * 
 * Uso:
 *   npx tsx scripts/run-registration-campaign.ts
 */

import { sendRegistrationEmails } from '../jobs/sendRegistrationEmail';

console.log('🚀 Starting Registration Email Campaign...\n');
console.log('This will send emails to:');
console.log('  1. All emails in Newsletter table');
console.log('  2. All parent emails in Enrollment table (isactive = true or false)\n');
console.log('='.repeat(60) + '\n');

sendRegistrationEmails()
  .then(() => {
    console.log('\n✅ Campaign completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Campaign failed:', error);
    process.exit(1);
  });



