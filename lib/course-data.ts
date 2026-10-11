export type Course = {
  id: string
  number: string
  title: string
  level: string
  lessons: number
  accent: 'lime' | 'blue' | 'violet'
  description: string
}

export const COURSES: Course[] = [
  {
    id: 'cybersecurity-foundations',
    number: '01',
    title: 'Cybersecurity Foundations',
    level: 'Beginner',
    lessons: 12,
    accent: 'lime',
    description: 'The essential mental models, vocabulary, and habits every hunter needs.',
  },
  {
    id: 'web-hacking-essentials',
    number: '02',
    title: 'Web Hacking Essentials',
    level: 'Intermediate',
    lessons: 18,
    accent: 'blue',
    description: 'Understand the web stack and learn how to test it safely.',
  },
  {
    id: 'art-of-reconnaissance',
    number: '03',
    title: 'The Art of Reconnaissance',
    level: 'Intermediate',
    lessons: 9,
    accent: 'violet',
    description: 'Turn scattered signals into useful intelligence before the first exploit.',
  },
]

export const COURSE_COUNT = COURSES.length
export const CHALLENGE_COUNT = COURSES.reduce((total, course) => total + course.lessons, 0)

export function getCourse(courseId: string) {
  return COURSES.find((course) => course.id === courseId)
}
