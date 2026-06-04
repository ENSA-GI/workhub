const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk('c:/Users/user/Desktop/RH/workhub/frontend/src');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('/employee?') || content.includes('/employee/') || content.includes('/employee\'') || content.includes('/employee"') || content.includes('/employee`')) {
        console.log("MATCH:", file);
    }
});
