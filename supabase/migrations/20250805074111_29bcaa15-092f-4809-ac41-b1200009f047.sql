-- Delete all data from tables except user profiles
-- Delete in order to respect foreign key constraints

-- Clear lesson progress first
DELETE FROM lesson_progress;

-- Clear quiz attempts
DELETE FROM quiz_attempts;

-- Clear quiz questions
DELETE FROM quiz_questions;

-- Clear course feedback
DELETE FROM course_feedback;

-- Clear certificates
DELETE FROM certificates;

-- Clear enrollments
DELETE FROM enrollments;

-- Clear quizzes
DELETE FROM quizzes;

-- Clear lessons
DELETE FROM lessons;

-- Clear blogs
DELETE FROM blogs;

-- Clear courses
DELETE FROM courses;

-- Clear notifications
DELETE FROM notifications;

-- Clear announcements
DELETE FROM announcements;

-- Clear CMS content
DELETE FROM cms_content;