import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'instructor' | 'student';
  status: 'active' | 'inactive' | 'suspended';
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Auth useEffect triggered');
    
    // Set up auth state listener - CRITICAL: Never use async functions directly
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', { event, hasSession: !!session, hasUser: !!session?.user });
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setLoading(true);
          // Use setTimeout to defer Supabase calls and prevent deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', { hasSession: !!session, hasUser: !!session?.user });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setLoading(true);
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => subscription.unsubscribe();

  }, []);

  // Separate function to fetch user profile (prevents deadlocks)
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Fetch profile with retry logic
      let profileData = null;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries && !profileData) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (data && !error) {
          profileData = data;
          console.log('Profile fetched successfully:', data);
          break;
        }
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching profile:', error);
          break;
        }
        
        // If profile not found and this is the first attempt, try to create one
        if (retries === 0 && error?.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const userMetaData = user.user_metadata;
            const fullName = userMetaData?.full_name || userMetaData?.name || user.email?.split('@')[0] || 'User';
            const role = userMetaData?.role || 'student';
            
            const createdProfile = await createProfileIfNotExists(
              userId,
              user.email || '',
              fullName,
              role
            );
            
            if (createdProfile) {
              profileData = createdProfile;
              console.log('Profile created successfully:', createdProfile);
              break;
            }
          }
        }
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }
      
      setProfile(profileData);
    } catch (err) {
      console.error('Error in profile fetching:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setProfile(data as unknown as Profile);
  };

  // Function to create a profile if it doesn't exist
  const createProfileIfNotExists = async (userId: string, email: string, fullName: string, role: string = 'student') => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: email,
          full_name: fullName,
          role: role as 'admin' | 'instructor' | 'student',
          status: 'active' as const
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Exception creating profile:', err);
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      // The profile will be fetched automatically by the auth state change listener
      // which will update the profile state
      return { error: null };
    } catch (err) {
      console.error('Error in signIn:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string = 'student') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      
      return { error };
    } catch (err) {
      console.error('Exception in signUp:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        // Fallback: manually clear local state
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    } catch (err) {
      console.error('Exception in signOut:', err);
      // Fallback: manually clear local state
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};