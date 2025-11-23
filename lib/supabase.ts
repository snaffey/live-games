import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials are missing. Using placeholder values. Authentication and favorites features will not work properly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Debug function to check Supabase connection
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from('favorite_matches').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', {
        error: JSON.stringify(error),
        errorMessage: error.message || 'No error message',
        errorCode: 'code' in error ? error.code : 'No error code',
        details: 'details' in error ? error.details : 'No error details',
        stack: new Error().stack
      });
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: new Error().stack
    });
    return false;
  }
}

// Helper functions for auth
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper functions for favorites
export async function addFavoriteMatch(userId: string, matchId: string) {
  try {
    // First check if the match is already a favorite
    const { data: existingFavorite, error: checkError } = await supabase
      .from('favorite_matches')
      .select('id')
      .eq('user_id', userId)
      .eq('match_id', matchId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing favorite:', checkError);
      return { data: null, error: checkError };
    }
    
    // If already a favorite, return early with success
    if (existingFavorite) {
      return { data: existingFavorite, error: null };
    }
    
    // If not a favorite, insert it
    const { data, error } = await supabase
      .from('favorite_matches')
      .insert([{ user_id: userId, match_id: matchId }]);
      
    return { data, error };
  } catch (error) {
    console.error('Unexpected error in addFavoriteMatch:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

export async function removeFavoriteMatch(userId: string, matchId: string) {
  const { data, error } = await supabase
    .from('favorite_matches')
    .delete()
    .match({ user_id: userId, match_id: matchId });
  return { data, error };
}

export async function getFavoriteMatches(userId: string) {
  try {
    // First check if the table exists by trying to get its schema
    const { error: schemaError } = await supabase
      .from('favorite_matches')
      .select('count', { count: 'exact', head: true });
    
    if (schemaError) {
      console.error('Error checking favorite_matches table:', {
        error: JSON.stringify(schemaError),
        errorMessage: schemaError.message || 'No error message',
        errorCode: 'code' in schemaError ? schemaError.code : 'No error code',
        details: 'details' in schemaError ? schemaError.details : 'No error details',
        supabaseUrl: supabaseUrl,
        hasCredentials: !!supabaseUrl && !!supabaseAnonKey
      });
      
      // If we get a 404, the table likely doesn't exist
      if (schemaError.code === '404' || schemaError.message?.includes('Not Found')) {
        console.error('The favorite_matches table does not exist in your Supabase project. Please create it with the following SQL:\n' +
          'CREATE TABLE public.favorite_matches (\n' +
          '  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,\n' +
          '  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,\n' +
          '  match_id text NOT NULL,\n' +
          '  created_at timestamp with time zone DEFAULT now()\n' +
          ');\n' +
          'CREATE UNIQUE INDEX favorite_matches_user_id_match_id_idx ON public.favorite_matches (user_id, match_id);\n' +
          'ALTER TABLE public.favorite_matches ENABLE ROW LEVEL SECURITY;\n' +
          'CREATE POLICY "Users can manage their own favorites" ON public.favorite_matches\n' +
          '  FOR ALL USING (auth.uid() = user_id);');
      }
      
      return { data: null, error: schemaError };
    }
    
    // If the table exists, proceed with the query
    const { data, error } = await supabase
      .from('favorite_matches')
      .select('match_id')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error in getFavoriteMatches:', {
        error: JSON.stringify(error),
        userId,
        errorMessage: error.message || 'No error message',
        errorCode: 'code' in error ? error.code : 'No error code',
        details: 'details' in error ? error.details : 'No error details'
      });
    }
    
    return { data, error };
  } catch (unexpectedError) {
    console.error('Unexpected error in getFavoriteMatches:', {
      error: unexpectedError,
      userId,
      errorMessage: unexpectedError instanceof Error ? unexpectedError.message : String(unexpectedError),
      stack: new Error().stack
    });
    return { data: null, error: unexpectedError instanceof Error ? unexpectedError : new Error(String(unexpectedError)) };
  }
}