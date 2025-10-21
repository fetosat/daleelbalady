const { spawn } = require('child_process');

console.log('🚚 Testing Delivery System Build...');

const testBuild = spawn('powershell', ['-Command', 'npm run build'], {
  stdio: 'inherit',
  cwd: __dirname
});

testBuild.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build successful! Delivery system is ready!');
  } else {
    console.log('❌ Build failed. Check the errors above.');
  }
  process.exit(code);
});
