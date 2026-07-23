import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

async function startTunnel() {
  const port = process.env.PORT || '3000';
  console.log(`🌐 Launching ngrok tunnel on port ${port}...`);

  // Start ngrok in background
  const ngrokProcess = spawn('ngrok', ['http', port], {
    stdio: 'ignore',
    detached: true,
  });
  ngrokProcess.unref();

  console.log('⏳ Waiting for ngrok tunnel URL...');

  let ngrokUrl = '';
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    try {
      const res = await fetch('http://localhost:4040/api/tunnels');
      const data = await res.json();
      const publicUrl = data.tunnels?.[0]?.public_url;
      if (publicUrl) {
        ngrokUrl = publicUrl;
        break;
      }
    } catch (e) {
      // ngrok API not ready yet
    }
  }

  if (!ngrokUrl) {
    console.error('❌ Could not get public URL from ngrok API at http://localhost:4040');
    console.error('   Make sure ngrok is authenticated (`ngrok config add-authtoken <token>`).');
    process.exit(1);
  }

  console.log(`\n🎉 Public ngrok Tunnel URL: ${ngrokUrl}`);

  // Update NEXT_PUBLIC_APP_URL in .env
  const envPath = path.join(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');

  if (envContent.includes('NEXT_PUBLIC_APP_URL=')) {
    envContent = envContent.replace(/NEXT_PUBLIC_APP_URL=.*/, `NEXT_PUBLIC_APP_URL=${ngrokUrl}`);
  } else {
    envContent += `\nNEXT_PUBLIC_APP_URL=${ngrokUrl}\n`;
  }

  fs.writeFileSync(envPath, envContent, 'utf-8');

  console.log(`✅ Updated NEXT_PUBLIC_APP_URL in .env -> ${ngrokUrl}`);
  console.log(`\n📡 Apify webhooks will now post to: ${ngrokUrl}/api/webhooks/apify-jobs`);
  process.exit(0);
}

startTunnel();
