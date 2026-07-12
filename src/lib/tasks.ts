import { supabase } from './supabase';

export type InboxTask = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    created_at: string;
}

export async function getInboxTasks(): Promise<InboxTask[]> {
    const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description, status, created_at')
        .eq('status', 'inbox')
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data ?? [];
}

export async function createInboxTask(title: string): Promise<InboxTask> {
    const cleanedTitle = title.trim();

    if (!cleanedTitle) {
        throw new Error('Please enter something to capture.');
    }

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            title: cleanedTitle,
            status: 'inbox',
        })
        .select('id, title, description, status, created_at')
        .single();

    if (error) {
        throw error;
    }

    return data;
}