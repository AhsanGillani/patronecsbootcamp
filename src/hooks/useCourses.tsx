import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  instructor_id: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category_id: string | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  total_enrollments: number;
  lesson_count: number;
  total_duration: number;
  slug?: string;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
  };
  instructor?: {
    full_name: string;
  };
}

interface UseCoursesOptions {
  categoryId?: string;
  limit?: number;
  search?: string;
}

export const useCourses = (options: UseCoursesOptions = {}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching courses with options:', options);
        
        // First get courses without instructor data
        let query = supabase
          .from('courses')
          .select(`
            *,
            categories!courses_category_id_fkey(name)
          `)
          .eq('status', 'approved')
          .eq('soft_deleted', false)
          .order('created_at', { ascending: false });

        if (options.categoryId) {
          query = query.eq('category_id', options.categoryId);
        }

        if (options.search) {
          query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data: courses, error } = await query;

        if (error) {
          console.error('Course query error:', error);
          throw error;
        }

        // Then get public instructor profiles separately
        const { data: instructorProfiles, error: instructorError } = await supabase
          .rpc('get_public_instructor_profiles');

        if (instructorError) {
          console.error('Error fetching instructor profiles:', instructorError);
          // Continue without instructor data rather than failing completely
        }

        console.log('Courses fetched successfully:', courses?.length);
        
        // Transform data to match interface with proper type safety
        const transformedCourses = (courses || []).map((course: any) => ({
          ...course,
          category: course.categories && typeof course.categories === 'object' && 'name' in course.categories 
            ? { name: course.categories.name } 
            : undefined,
          instructor: instructorProfiles?.find((p: any) => p.user_id === course.instructor_id) || undefined
        }));

        setCourses(transformedCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [options.categoryId, options.limit, options.search]);

  return { courses, loading, error };
};