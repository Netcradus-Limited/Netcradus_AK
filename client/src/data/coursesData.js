/**
 * Backward compatibility adapter for courseData.
 * Maps legacy keys to official 11 programmes from programmesData.js.
 */
import { PROGRAMMES } from './programmesData';

export const courseData = {};

PROGRAMMES.forEach((prog) => {
  courseData[prog.slug] = {
    key: prog.slug,
    title: prog.title,
    category: prog.track.toUpperCase(),
    image: prog.thumbnail,
    duration: "Structured Practical Curriculum",
    level: prog.idealFor,
    prereq: prog.idealFor,
    tools: prog.tools,
    cert: `Netcradus Certified ${prog.title}`,
    roles: prog.careerRoles,
    curriculum: prog.modules.map((m) => `Module ${m.number}: ${m.title}`)
  };
});

// Legacy aliases
courseData.cyber = courseData['vapt-analyst'];
courseData.soc = courseData['soc-analyst'];
courseData.cloud = courseData['cloud-security-analyst'];
courseData.ai = courseData['ai-developer'];
courseData.devops = courseData['devsecops'];
courseData.fullstack = courseData['devsecops'];
courseData.data = courseData['ai-automation'];

export default courseData;
