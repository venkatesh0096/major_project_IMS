const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const filesToFix = [
    'src/context/ExamContext.jsx',
    'src/context/NoticeContext.jsx',
    'src/context/SettingsContext.jsx',
    'src/context/TimetableContext.jsx',
    'src/context/UserContext.jsx',
    'src/context/FeeContext.jsx',
    'src/context/AttendanceContext.jsx',
    'src/pages/Teachers_staf/resources/TeacherResources.jsx',
    'src/pages/Teachers_staf/requests/TeacherRequests.jsx',
    'src/pages/Student/resources/StudentResources.jsx',
    'src/pages/Student/requests/StudentRequests.jsx',
    'src/pages/admin/Academics/Academics.jsx',
    'src/pages/admin/A_Dashboard/Dashboard.jsx',
    'src/pages/admin/NoticeBoard/CreateNotice.jsx',
    'src/pages/admin/User_Management/add_user.jsx',
    'src/services/attendance.service.js',
    'src/services/marks.service.js'
];

for (const file of filesToFix) {
    if (!fs.existsSync(file)) {
        console.log(`File not found: ${file}`);
        continue;
    }

    console.log(`Fixing ${file}`);
    
    // Get the file content exactly as it was 2 commits ago (before the global replace)
    let oldContent;
    try {
        // We know the replace happened 2 commits ago (HEAD~2) when we did the global replacement
        oldContent = execSync(`git show HEAD~2:${file}`, { encoding: 'utf8' });
    } catch (e) {
        console.log(`Could not find history for ${file}, skipping.`);
        continue;
    }

    let currentContent = fs.readFileSync(file, 'utf8');

    // Extract all the original fetch URLs (e.g. `http://localhost:5001/api/exams`)
    // Also matched some const API_URL = "http://localhost:5001/api/foo"
    const oldMatches = [...oldContent.matchAll(/http:\/\/localhost:5001(\/api\/[a-zA-Z0-9_/?=-]+)/g)];
    
    if (oldMatches.length === 0) {
        // Did it match any trailing slash or anything?
        const fallbackMatches = [...oldContent.matchAll(/http:\/\/localhost:5001(\/api[a-zA-Z0-9_/?=-]*)/g)];
        if (fallbackMatches.length === 0) {
            console.log(`No URLs to replace in ${file}`);
            continue;
        }
    }

    // The current file has template literals like:  `${import.meta.env.VITE_API_URL}/api`
    let currentIndex = 0;
    
    // Match the broken replacement string
    const brokenRegex = /\`\$\{import\.meta\.env\.VITE_API_URL\}\/api\`/g;
    
    let replacedCount = 0;
    currentContent = currentContent.replace(brokenRegex, () => {
        if (currentIndex < oldMatches.length) {
            const originalPath = oldMatches[currentIndex][1]; // e.g. /api/exams
            currentIndex++;
            replacedCount++;
            return `\`\${import.meta.env.VITE_API_URL}${originalPath}\``;
        }
        return `\`\${import.meta.env.VITE_API_URL}/api\``; // Fallback
    });

    if (replacedCount > 0) {
        fs.writeFileSync(file, currentContent);
        console.log(`Updated ${replacedCount} URLs in ${file}`);
    } else {
        console.log(`No broken URLs found to replace in ${file}`);
    }
}
