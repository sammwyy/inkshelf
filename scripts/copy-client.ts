import fs from 'fs';
import path from 'path';

const src = path.resolve('webclient/dist');
const dest = path.resolve('dist/public');

if (!fs.existsSync(src)) {
    console.error(`Source directory ${src} does not exist. Did you build the client?`);
    process.exit(1);
}

if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
}

fs.mkdirSync(dest, { recursive: true });

function copyRecursiveSync(src: string, dest: string) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

console.log(`Copying ${src} to ${dest}...`);
copyRecursiveSync(src, dest);
console.log('Done!');
