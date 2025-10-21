#!/usr/bin/env node

/**
 * Quick Build Test Script
 * Tests the build configuration without running full build
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Daleel Balady - Quick Build Test');
console.log('=====================================');

// Test 1: Check Node.js version
console.log('\n[1/6] Checking Node.js version...');
console.log('Node.js:', process.version);
if (parseInt(process.version.slice(1)) < 18) {
    console.log('❌ Node.js version should be 18+');
    process.exit(1);
} else {
    console.log('✅ Node.js version is compatible');
}

// Test 2: Check package.json
console.log('\n[2/6] Checking package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    console.log('✅ package.json is valid');
    console.log('   Project:', packageJson.name);
    console.log('   Next.js:', packageJson.dependencies?.next);
} catch (error) {
    console.log('❌ package.json error:', error.message);
    process.exit(1);
}

// Test 3: Check next.config.mjs
console.log('\n[3/6] Checking next.config.mjs...');
try {
    if (fs.existsSync('./next.config.mjs')) {
        console.log('✅ next.config.mjs exists');
        
        const config = fs.readFileSync('./next.config.mjs', 'utf8');
        if (config.includes('max-old-space-size')) {
            console.log('✅ Memory optimizations detected');
        }
        if (config.includes('parallelism: 1')) {
            console.log('✅ Webpack parallelism optimizations detected');
        }
    } else {
        console.log('❌ next.config.mjs not found');
    }
} catch (error) {
    console.log('❌ next.config.mjs error:', error.message);
}

// Test 4: Check critical components
console.log('\n[4/6] Checking critical components...');
const criticalFiles = [
    './src/components/MedicalServiceView.tsx',
    './src/app/layout.tsx',
    './src/app/page.tsx'
];

criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log('✅', path.basename(file), 'exists');
    } else {
        console.log('⚠️ ', path.basename(file), 'not found');
    }
});

// Test 5: Check memory configuration
console.log('\n[5/6] Checking memory configuration...');
const nodeOptions = process.env.NODE_OPTIONS;
if (nodeOptions && nodeOptions.includes('max-old-space-size')) {
    console.log('✅ NODE_OPTIONS configured:', nodeOptions);
} else {
    console.log('⚠️  NODE_OPTIONS not set. Run:');
    console.log('   Windows: $env:NODE_OPTIONS = "--max-old-space-size=4096"');
    console.log('   Linux:   export NODE_OPTIONS="--max-old-space-size=4096"');
}

// Test 6: Build scripts availability
console.log('\n[6/6] Checking build scripts...');
const buildScripts = [
    './build-production.ps1',
    './build-production.bat', 
    './build-production.sh'
];

buildScripts.forEach(script => {
    if (fs.existsSync(script)) {
        console.log('✅', path.basename(script), 'available');
    } else {
        console.log('⚠️ ', path.basename(script), 'not found');
    }
});

console.log('\n=====================================');
console.log('🎉 Build environment check completed!');
console.log('\n💡 Next steps:');
console.log('1. Set NODE_OPTIONS if not already set');
console.log('2. Run: npm run build (or use build scripts)');
console.log('3. Monitor memory usage during build');

console.log('\n🚀 Ready for build testing!');
