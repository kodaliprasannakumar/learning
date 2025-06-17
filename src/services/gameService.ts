import { supabase } from '@/integrations/supabase/client';
import { APIResponse } from '@/types';
import { ERROR_MESSAGES } from '@/constants';

// Types matching the actual database schema
interface DatabaseDoodle {
  id: string;
  user_id: string;
  title: string;
  image_url: string;
  original_image_url: string;
  video_url: string;
  details: any; // JSON type
  created_at: string;
}

export class GameService {
  /**
   * Save user's doodle creation
   */
  static async saveDoodle(doodleData: Omit<DatabaseDoodle, 'id' | 'created_at'>): Promise<APIResponse<DatabaseDoodle>> {
    try {
      const { data, error } = await supabase
        .from('doodles')
        .insert([doodleData])
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error saving doodle:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC_ERROR 
      };
    }
  }

  /**
   * Get user's saved doodles
   */
  static async getUserDoodles(userId: string, limit = 20): Promise<APIResponse<DatabaseDoodle[]>> {
    try {
      const { data, error } = await supabase
        .from('doodles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching doodles:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC_ERROR 
      };
    }
  }

  /**
   * Delete a doodle
   */
  static async deleteDoodle(doodleId: string, userId: string): Promise<APIResponse<void>> {
    try {
      const { error } = await supabase
        .from('doodles')
        .delete()
        .eq('id', doodleId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting doodle:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC_ERROR 
      };
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string): Promise<APIResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC_ERROR 
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: any): Promise<APIResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC_ERROR 
      };
    }
  }

  /**
   * Get all doodles (public feed)
   */
  static async getAllDoodles(limit = 20, offset = 0): Promise<APIResponse<DatabaseDoodle[]>> {
    try {
      const { data, error } = await supabase
        .from('doodles')
        .select(`
          *,
          profiles!inner(username, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error fetching all doodles:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC_ERROR 
      };
    }
  }

  /**
   * Search doodles by title
   */
  static async searchDoodles(query: string, limit = 20): Promise<APIResponse<DatabaseDoodle[]>> {
    try {
      const { data, error } = await supabase
        .from('doodles')
        .select(`
          *,
          profiles!inner(username, avatar_url)
        `)
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Error searching doodles:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERIC_ERROR 
      };
    }
  }
} 