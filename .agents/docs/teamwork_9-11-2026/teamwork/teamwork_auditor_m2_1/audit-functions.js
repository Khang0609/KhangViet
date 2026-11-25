const path = require("path");
const ts = require(path.resolve(process.cwd(), "node_modules/.pnpm/typescript@5.9.3/node_modules/typescript"));
const fs = require("fs");

function walkDir(dir) {
    let files = [];
    for (const f of fs.readdirSync(dir)) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) files = files.concat(walkDir(full));
        else if (full.endsWith(".ts")) files.push(full);
    }
    return files;
}

const files = walkDir("apps/media-worker/src");
let violations = [];
let allFunctions = [];

files.forEach(file => {
    const content = fs.readFileSync(file, "utf8");
    const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

    function checkNode(node) {
        if (
            ts.isFunctionDeclaration(node) ||
            ts.isMethodDeclaration(node) ||
            ts.isArrowFunction(node) ||
            ts.isFunctionExpression(node)
        ) {
            const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
            const lineCount = end.line - start.line + 1;
            const name = node.name ? node.name.getText(sourceFile) : (node.parent && node.parent.name ? node.parent.name.getText(sourceFile) : "<anonymous>");
            allFunctions.push({ file: path.relative(".", file).replace(/\\/g, "/"), name, lineCount, startLine: start.line + 1, endLine: end.line + 1 });
            if (lineCount > 35) {
                violations.push({ file: path.relative(".", file).replace(/\\/g, "/"), name, lineCount, startLine: start.line + 1, endLine: end.line + 1 });
            }
        }
        ts.forEachChild(node, checkNode);
    }

    checkNode(sourceFile);
});

console.log("Total functions/methods/arrow functions inspected:", allFunctions.length);
allFunctions.sort((a,b) => b.lineCount - a.lineCount);
console.log("Longest functions:");
allFunctions.forEach(f => console.log(`  ${f.file} -> ${f.name} (lines ${f.startLine}-${f.endLine}): ${f.lineCount} lines`));

if (violations.length > 0) {
    console.error("\n❌ VIOLATIONS FOUND (>35 lines):", JSON.stringify(violations, null, 2));
    process.exit(1);
} else {
    console.log("\n✅ ALL FUNCTIONS <= 35 lines! PASS.");
}
