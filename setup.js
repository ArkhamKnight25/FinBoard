#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# FinBoard - Finance API Keys
# IMPORTANT: Do NOT use NEXT_PUBLIC_ prefix - these keys should stay on the server!
# Get your free API key from: https://finnhub.io/register

FINNHUB_API_KEY=demo

# Optional: Alpha Vantage API (for additional data sources)
# Get your free API key from: https://www.alphavantage.co/support/#api-key

ALPHAVANTAGE_API_KEY=demo
`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with demo API keys');
  console.log('⚠️  IMPORTANT: API keys are now server-side only (secure!)');
  console.log('📝 Please update with your own API keys from:');
  console.log('   - Finnhub: https://finnhub.io/register');
  console.log('   - Alpha Vantage: https://www.alphavantage.co/support/#api-key');
  console.log('');
  console.log('🔒 Security: Keys without NEXT_PUBLIC_ prefix stay on the server');
} else {
  console.log('⚠️  .env.local already exists. Skipping...');
  console.log('💡 Make sure your keys do NOT have NEXT_PUBLIC_ prefix for security!');
}
