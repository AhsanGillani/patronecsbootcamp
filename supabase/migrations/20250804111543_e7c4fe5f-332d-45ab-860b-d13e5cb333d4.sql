-- Add RLS policy for students to view published lessons
CREATE POLICY "Students can view published lessons for approved courses" 
ON public.lessons 
FOR SELECT 
USING (
  is_published = true 
  AND EXISTS (
    SELECT 1 FROM courses c 
    WHERE c.id = lessons.course_id 
    AND c.status = 'approved'
  )
);