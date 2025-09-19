#!/usr/bin/env node

// Build script with memory optimization
process.env.NODE_OPTIONS = '--max-old-space-size=8192';
process.env.NEXT_TELEMETRY_DISABLED = '1';

const { spawn } = require('child_process');

console.log('🚀 Starting build with memory optimization...');
console.log('📊 Memory limit set to 8GB');

// Use the correct command for Windows/Unix compatibility
const isWindows = process.platform === 'win32';
const command = isWindows ? 'npx.cmd' : 'npx';
const args = ['next', 'build'];

const buildProcess = spawn(command, args, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=8192',
    NEXT_TELEMETRY_DISABLED: '1'
  }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
  } else {
    console.log(`❌ Build failed with exit code ${code}`);
    process.exit(code);
  }
});

buildProcess.on('error', (err) => {
  console.error('❌ Build process error:', err);
  process.exit(1);
});
