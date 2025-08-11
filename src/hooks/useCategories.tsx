import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  slug?: string;
  course_count?: number;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch categories with course counts
        const { data, error } = await supabase
          .from('categories')
          .select(`
            *,
            courses!courses_category_id_fkey(count)
          `)
          .order('name');

        if (error) throw error;

        // Transform data to include course count
        const categoriesWithCounts = data?.map(category => ({
          ...category,
          course_count: category.courses?.[0]?.count || 0
        })) || [];

        setCategories(categoriesWithCounts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};