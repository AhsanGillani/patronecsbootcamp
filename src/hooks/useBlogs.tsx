import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_id: string;
  category_id: string | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  is_published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
  };
  profile?: {
    full_name: string;
  };
}

interface UseBlogsOptions {
  categoryId?: string;
  limit?: number;
  search?: string;
}

export const useBlogs = (options: UseBlogsOptions = {}) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('blogs')
          .select(`
            *,
            category:categories!category_id(name),
            profile:profiles!author_id(full_name)
          `)
          .eq('status', 'approved')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (options.categoryId) {
          query = query.eq('category_id', options.categoryId);
        }

        if (options.search) {
          query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%,excerpt.ilike.%${options.search}%`);
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        setBlogs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [options.categoryId, options.limit, options.search]);

  return { blogs, loading, error };
};