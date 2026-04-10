const fs = require('fs');
const path = require('path');
const Rule = require('../models/Rule');
const AuditLog = require('../models/AuditLog');
const { generateFileHash, findDuplicate } = require('./deduplication');
const File = require('../models/File');

// Ensure organized directory exists
const ORGANIZED_DIR = path.resolve(__dirname, '../../organized');
if (!fs.existsSync(ORGANIZED_DIR)) fs.mkdirSync(ORGANIZED_DIR, { recursive: true });

const processFile = async (filePath) => {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(fileName).slice(1).toLowerCase(); // remove dot

    try {
        console.log(`[Organizer] Processing file: ${filePath}`);
        console.log(`[Organizer] Resolved abs path: ${path.resolve(filePath)}`);

        // 1. Calculate Hash & Check Duplicates
        const fileHash = await generateFileHash(filePath);
        const duplicate = await findDuplicate(fileHash);

        if (duplicate) {
            console.log(`Duplicate found: ${fileName} -> ${duplicate.filename}`);
            await AuditLog.create({
                eventType: 'DUPLICATE_FOUND',
                filePath: filePath,
                details: `Duplicate of ${duplicate.filename} (Hash: ${fileHash})`
            });
            // Option: Delete duplicate source to save space
            fs.unlinkSync(filePath);
            return;
        }

        // 2. Fetch Rules
        const rules = await Rule.find({ isActive: true });
        let targetFolder = 'Uncategorized';

        // 3. Match Rules
        for (const rule of rules) {
            if (rule.criteria.extension && rule.criteria.extension.includes(fileExt)) {
                targetFolder = rule.targetFolder;
                break;
            }
        }

        // 4. Move File
        const destDir = path.join(ORGANIZED_DIR, targetFolder);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        const destPath = path.join(destDir, fileName);
        fs.renameSync(filePath, destPath);

        // 5. Save Metadata
        await File.create({
            filename: fileName,
            originalName: fileName,
            fileType: fileExt,
            fileSize: fs.statSync(destPath).size,
            fileHash: fileHash,
            filePath: destPath
        });

        // 6. Log Action
        await AuditLog.create({
            eventType: 'MOVED',
            filePath: destPath,
            details: `Moved to ${targetFolder} based on rule matching`
        });

        console.log(`Organized: ${fileName} -> ${targetFolder}`);

    } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
        await AuditLog.create({
            eventType: 'ERROR',
            filePath: filePath,
            details: err.message
        });
    }
};

const reorganizeLibrary = async () => {
    console.log("[Organizer] Starting Reorganization...");
    const files = await File.find();
    let movedCount = 0;

    // Fetch active rules
    const rules = await Rule.find({ isActive: true });

    for (const fileDoc of files) {
        try {
            const currentPath = fileDoc.filePath;

            // Verify file exists
            if (!fs.existsSync(currentPath)) {
                console.log(`[Reorg] File missing on disk: ${currentPath}`);
                continue;
            }

            const fileName = fileDoc.filename;
            const fileExt = fileDoc.fileType; // Already has extension from DB

            let targetFolder = 'Uncategorized';

            // Match Rules
            for (const rule of rules) {
                if (rule.criteria.extension && rule.criteria.extension.includes(fileExt)) {
                    targetFolder = rule.targetFolder;
                    break;
                }
            }

            // Check if it needs moving
            // Construct expected path
            const expectedDir = path.join(ORGANIZED_DIR, targetFolder);
            const expectedPath = path.join(expectedDir, fileName);

            // Compare paths (normalize slashes)
            if (path.resolve(currentPath) !== path.resolve(expectedPath)) {
                console.log(`[Reorg] Moving ${fileName} from ${path.dirname(currentPath)} to ${targetFolder}`);

                // Ensure dest dir
                if (!fs.existsSync(expectedDir)) fs.mkdirSync(expectedDir, { recursive: true });

                // Move file
                fs.renameSync(currentPath, expectedPath);

                // Update DB
                fileDoc.filePath = expectedPath;
                await fileDoc.save();

                // Log
                await AuditLog.create({
                    eventType: 'MOVED',
                    filePath: expectedPath,
                    details: `[Reorg] Moved to ${targetFolder}`
                });

                movedCount++;
            }

        } catch (err) {
            console.error(`[Reorg] Error processing ${fileDoc.filename}:`, err);
        }
    }

    console.log(`[Organizer] Reorganization complete. Moved ${movedCount} files.`);
    return { moved: movedCount, total: files.length };
};

module.exports = { processFile, reorganizeLibrary };
