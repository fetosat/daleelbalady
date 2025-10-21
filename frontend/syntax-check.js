const fs = require('fs');
const path = require('path');

// Simple function to check basic syntax errors
function checkBasicSyntax(content) {
    const errors = [];
    
    // Check for unmatched brackets
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
        errors.push(`Unmatched braces: ${openBraces} open, ${closeBraces} close`);
    }
    
    // Check for const declarations without initialization
    const constRegex = /const\s+[a-zA-Z_]\w*\s*$/gm;
    const constMatches = content.match(constRegex);
    if (constMatches) {
        errors.push(`Uninitialized const declarations: ${constMatches.length}`);
    }
    
    // Check for return statements outside functions (simple check)
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('return') && !line.includes('=>') && !line.includes('function')) {
            // More sophisticated check needed, but this gives us a start
        }
    }
    
    return errors;
}

// Read the file
const filePath = path.join(__dirname, 'src', 'app', 'admin', 'subscriptions', 'page.tsx');

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = checkBasicSyntax(content);
    
    if (errors.length === 0) {
        console.log('✅ Basic syntax check passed!');
    } else {
        console.log('❌ Syntax errors found:');
        errors.forEach(error => console.log(`  - ${error}`));
    }
} catch (error) {
    console.error('Error reading file:', error.message);
}
