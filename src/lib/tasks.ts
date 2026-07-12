import { supabase } from './supabase';

export type InboxTask = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    created_at: string;
};

export type TaskDetail = {
    id: string;
    title: string;
    description: string | null;
    next_action: string | null;
    why_it_matters: string | null;
    status: string;
    scheduled_for: string | null;
    due_at: string | null;
    estimated_minutes: number | null;
    actual_minutes: number | null;
    energy_required: 'low' | 'medium' | 'high' | null;
    context: 'deep_work' | 'admin' | 'errand' | 'communication' | 'learning' | null;
    friction_type:
    | 'vague'
    | 'too_big'
    | 'blocked'
    | 'boring'
    | 'uncertain'
    | 'emotional'
    | 'low_energy'
    | 'interrupted'
    | 'not_important'
    | null;
    created_at: string;
    updated_at: string;
};

export type ClarifyTaskInput = {
    next_action: string;
    why_it_matters?: string;
    estimated_minutes?: number | null;
    energy_required?: 'low' | 'medium' | 'high' | null;
    context?: 'deep_work' | 'admin' | 'errand' | 'communication' | 'learning' | null;
    friction_type?:
    | 'vague'
    | 'too_big'
    | 'blocked'
    | 'boring'
    | 'uncertain'
    | 'emotional'
    | 'low_energy'
    | 'interrupted'
    | 'not_important'
    | null;
};

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

export async function getTaskById(taskId: string): Promise<TaskDetail> {
    const { data, error } = await supabase
        .from('tasks')
        .select(`
      id,
      title,
      description,
      next_action,
      why_it_matters,
      status,
      scheduled_for,
      due_at,
      estimated_minutes,
      actual_minutes,
      energy_required,
      context,
      friction_type,
      created_at,
      updated_at
    `)
        .eq('id', taskId)
        .single();

    if (error) {
        throw error;
    }

    return data as TaskDetail;
}

export async function clarifyTask(
    taskId: string,
    input: ClarifyTaskInput
): Promise<TaskDetail> {
    const cleanedNextAction = input.next_action.trim();

    if (!cleanedNextAction) {
        throw new Error('Please add the next action for this task.');
    }

    const { data, error } = await supabase
        .from('tasks')
        .update({
            next_action: cleanedNextAction,
            why_it_matters: input.why_it_matters?.trim() || null,
            estimated_minutes: input.estimated_minutes ?? null,
            energy_required: input.energy_required ?? null,
            context: input.context ?? null,
            friction_type: input.friction_type ?? null,
            status: 'clarified',
        })
        .eq('id', taskId)
        .select(`
      id,
      title,
      description,
      next_action,
      why_it_matters,
      status,
      scheduled_for,
      due_at,
      estimated_minutes,
      actual_minutes,
      energy_required,
      context,
      friction_type,
      created_at,
      updated_at
    `)
        .single();

    if (error) {
        throw error;
    }

    return data as TaskDetail;
}


export function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export async function addTaskToToday(taskId: string) {
    const today = getLocalDateString();

    const { data, error } = await supabase.rpc('add_task_to_daily_plan', {
        p_task_id: taskId,
        p_plan_date: today,
        p_order_index: 0,
        p_commitment_level: 'should',
    });

    if (error) {
        throw error;
    }

    return data;
}