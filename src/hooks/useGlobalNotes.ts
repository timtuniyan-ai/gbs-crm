import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { GlobalNote } from '../types';

export function useGlobalNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<GlobalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gbs_crm_global_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotes(
        data.map((note) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          createdAt: new Date(note.created_at),
          updatedAt: new Date(note.updated_at),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (title: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('gbs_crm_global_notes')
        .insert([
          {
            title,
            content,
            user_id: userId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newNote: GlobalNote = {
        id: data.id,
        title: data.title,
        content: data.content,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setNotes([newNote, ...notes]);
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
      throw err;
    }
  };

  const updateNote = async (id: string, title: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('gbs_crm_global_notes')
        .update({
          title,
          content,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedNote: GlobalNote = {
        id: data.id,
        title: data.title,
        content: data.content,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setNotes(notes.map((note) => (note.id === id ? updatedNote : note)));
      return updatedNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gbs_crm_global_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.filter((note) => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    refreshNotes: fetchNotes,
  };
}

