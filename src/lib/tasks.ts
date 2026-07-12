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

export type TodayPlanTask = {
    plan_item_id: string;
    task_id: string;
    title: string;
    next_action: string | null;
    why_it_matters: string | null;
    status: string;
    estimated_minutes: number | null;
    context: string | null;
    energy_required: string | null;
    order_index: number;
    commitment_level: 'must' | 'should' | 'could';
    project_name: string | null;
};

export type TodayPlan = {
    id: string;
    plan_date: string;
    main_outcome: string | null;
    planned_minutes: number;
    completed_minutes: number;
    status: string;
    items: TodayPlanTask[];
};

export type RecoveryTask = {
    id: string;
    title: string;
    next_action: string | null;
    status: string;
    context: string | null;
    estimated_minutes: number | null;
    updated_at: string;
};

type DailyPlanItemRow = {
    id: string;
    order_index: number;
    commitment_level: 'must' | 'should' | 'could';
    tasks:
    | {
        id: string;
        title: string;
        next_action: string | null;
        why_it_matters: string | null;
        status: string;
        estimated_minutes: number | null;
        context: string | null;
        energy_required: string | null;
        projects:
        | {
            id: string;
            name: string;
        }
        | null;
    }
    | null;
};

export type FocusSession = {
    id: string;
    user_id: string;
    task_id: string;
    started_at: string;
    ended_at: string | null;
    duration_minutes: number | null;
    completed: boolean;
    notes: string | null;
    created_at: string;
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

export async function getTodayPlan(
    planDate = getLocalDateString()
): Promise<TodayPlan | null> {
    const { data: plan, error: planError } = await supabase
        .from('daily_plans')
        .select('id, plan_date, main_outcome, planned_minutes, completed_minutes, status')
        .eq('plan_date', planDate)
        .maybeSingle();

    if (planError) {
        throw planError;
    }

    if (!plan) {
        return null;
    }

    const { data: rows, error: itemsError } = await supabase
        .from('daily_plan_items')
        .select(`
      id,
      order_index,
      commitment_level,
      tasks (
        id,
        title,
        next_action,
        why_it_matters,
        status,
        estimated_minutes,
        context,
        energy_required,
        projects (
          id,
          name
        )
      )
    `)
        .eq('daily_plan_id', plan.id)
        .order('order_index', { ascending: true });

    if (itemsError) {
        throw itemsError;
    }

    const items: TodayPlanTask[] = ((rows ?? []) as unknown as DailyPlanItemRow[])
        .filter((row) => row.tasks)
        .map((row) => {
            const task = row.tasks!;

            return {
                plan_item_id: row.id,
                task_id: task.id,
                title: task.title,
                next_action: task.next_action,
                why_it_matters: task.why_it_matters,
                status: task.status,
                estimated_minutes: task.estimated_minutes,
                context: task.context,
                energy_required: task.energy_required,
                order_index: row.order_index,
                commitment_level: row.commitment_level,
                project_name: task.projects?.name ?? null,
            };
        });

    return {
        id: plan.id,
        plan_date: plan.plan_date,
        main_outcome: plan.main_outcome,
        planned_minutes: plan.planned_minutes,
        completed_minutes: plan.completed_minutes,
        status: plan.status,
        items,
    };
}

export async function getNeedsRecoveryTasks(): Promise<RecoveryTask[]> {
    const { data, error } = await supabase
        .from('tasks')
        .select('id, title, next_action, status, context, estimated_minutes, updated_at')
        .eq('status', 'needs_recovery')
        .order('updated_at', { ascending: false })
        .limit(5);

    if (error) {
        throw error;
    }

    return data ?? [];
}

function getRpcRow<T>(data: T | T[] | null): T {
    if (Array.isArray(data)) {
        if (!data[0]) {
            throw new Error('No data returned from Supabase function.');
        }

        return data[0];
    }

    if (!data) {
        throw new Error('No data returned from Supabase function.');
    }

    return data;
}

export async function getOpenFocusSessionForTask(
    taskId: string
): Promise<FocusSession | null> {
    const { data, error } = await supabase
        .from('focus_sessions')
        .select(`
      id,
      user_id,
      task_id,
      started_at,
      ended_at,
      duration_minutes,
      completed,
      notes,
      created_at
    `)
        .eq('task_id', taskId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function startFocusSession(taskId: string): Promise<FocusSession> {
    const existingSession = await getOpenFocusSessionForTask(taskId);

    if (existingSession) {
        return existingSession;
    }

    const { data, error } = await supabase.rpc('start_focus_session', {
        p_task_id: taskId,
    });

    if (error) {
        throw error;
    }

    return getRpcRow<FocusSession>(data);
}

export async function finishFocusSession({
    focusSessionId,
    completedTask,
    notes,
}: {
    focusSessionId: string;
    completedTask: boolean;
    notes?: string | null;
}): Promise<FocusSession> {
    const { data, error } = await supabase.rpc('finish_focus_session', {
        p_focus_session_id: focusSessionId,
        p_completed_task: completedTask,
        p_notes: notes ?? null,
    });

    if (error) {
        throw error;
    }

    return getRpcRow<FocusSession>(data);
}