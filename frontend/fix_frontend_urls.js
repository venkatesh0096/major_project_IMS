const fs = require('fs');
const { execSync } = require('child_process');

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
    'src/pages/admin/User_Management/add_user.jsx'
];

for (const file of filesToFix) {
    console.log(`Fixing ${file}`);
    
    // Get the file content exactly as it was 2 commits ago (before the global replace)
    let oldContent;
    try {
        oldContent = execSync(`git show HEAD~2:${file}`).toString();
    } catch (e) {
        console.log(`Could not find history for ${file}, skipping.`);
        continue;
    }

    // Get the current broken content
    let currentContent = fs.readFileSync(file, 'utf8');

    // Extract all the original fetch URLs (e.g. `http://localhost:5001/api/exams`)
    const oldMatches = [...oldContent.matchAll(/http:\/\/localhost:5001(\/api\/[a-zA-Z0-9_/?=-]+)/g)];
    
    if (oldMatches.length === 0) continue;

    // The current file has template literals like:  `${import.meta.env.VITE_API_URL}/api`
    // We want to replace these sequentially with the original paths we found.
    
    let currentIndex = 0;
    // This regex looks for the broken replacement. We know the script replaced the WHOLE original URL with this string.
    const brokenRegex = /\`\$\{import\.meta\.env\.VITE_API_URL\}\/api\`/g;
    
    currentContent = currentContent.replace(brokenRegex, () => {
        if (currentIndex < oldMatches.length) {
            const originalPath = oldMatches[currentIndex][1]; // e.g. /api/exams
            currentIndex++;
            return `\`\${import.meta.env.VITE_API_URL}${originalPath}\``;
        }
        return `\`\${import.meta.env.VITE_API_URL}/api\``; // Fallback to avoid breaking if mismatch
    });

    fs.writeFileSync(file, currentContent);
    console.log(`Updated ${currentIndex} URLs in ${file}`);
}
