const Rule = require('../models/Rule');

const defaultRules = [
    {
        name: 'Images',
        criteria: { extension: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'] },
        targetFolder: 'Images'
    },
    {
        name: 'Documents',
        criteria: { extension: ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'ppt', 'pptx', 'csv'] },
        targetFolder: 'Documents'
    },
    {
        name: 'Music',
        criteria: { extension: ['mp3', 'wav', 'aac', 'flac', 'ogg'] },
        targetFolder: 'Music'
    },
    {
        name: 'Videos',
        criteria: { extension: ['mp4', 'mkv', 'avi', 'mov', 'wmv'] },
        targetFolder: 'Videos'
    },
    {
        name: 'Archives',
        criteria: { extension: ['zip', 'rar', '7z', 'tar', 'gz'] },
        targetFolder: 'Archives'
    },
    {
        name: 'Code',
        criteria: { extension: ['js', 'html', 'css', 'json', 'py', 'java', 'cpp'] },
        targetFolder: 'Code'
    }
];

const seedDefaultRules = async (force = false) => {
    try {
        const count = await Rule.countDocuments();

        if (force) {
            console.log("Forcing Rule Seed: Clearing existing rules...");
            await Rule.deleteMany({});
            await Rule.insertMany(defaultRules);
            console.log("Default rules re-run successfully.");
            return;
        }

        if (count === 0) {
            console.log("No rules found. Seeding default rules...");
            await Rule.insertMany(defaultRules);
            console.log("Default rules added successfully.");
        } else {
            console.log(`Rules already exist (${count}). Skipping seed.`);
        }
    } catch (err) {
        console.error("Error seeding rules:", err);
    }
};

module.exports = { seedDefaultRules };
