import { supabase } from './supabase';

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

export type Project = {
    id: string;
    user_id: string;
    name: string;
    outcome: string | null;
    description: string | null;
    status: ProjectStatus;
    deadline: string | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
};

export type ProjectWithStats = Project & {
    total_tasks: number;
    done_tasks: number;
    needs_recovery_tasks: number;
    open_tasks: number;
    progress_percent: number;
};

type ProjectTaskCountRow = {
    id: string;
    project_id: string | null;
    status: string;
};

export type CreateProjectInput = {
    name: string;
    description?: string;
    outcome?: string;
};

function calculateProjectStats(
    project: Project,
    tasks: ProjectTaskCountRow[]
): ProjectWithStats {
    const projectTasks = tasks.filter((task) => task.project_id === project.id);

    const totalTasks = projectTasks.length;
    const doneTasks = projectTasks.filter((task) => task.status === 'done').length;
    const needsRecoveryTasks = projectTasks.filter(
        (task) => task.status === 'needs_recovery'
    ).length;

    const openTasks = projectTasks.filter((task) => {
        return task.status !== 'done' && task.status !== 'archived';
    }).length;

    const progressPercent =
        totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

    return {
        ...project,
        total_tasks: totalTasks,
        done_tasks: doneTasks,
        needs_recovery_tasks: needsRecoveryTasks,
        open_tasks: openTasks,
        progress_percent: progressPercent,
    };
}

export async function getProjectsByStatus(
    status: 'active' | 'archived'
): Promise<ProjectWithStats[]> {
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
      id,
      user_id,
      name,
      outcome,
      description,
      status,
      deadline,
      created_at,
      updated_at,
      completed_at
    `)
        .eq('status', status)
        .order('created_at', { ascending: false });

    if (projectsError) {
        throw projectsError;
    }

    const projectRows = (projects ?? []) as Project[];

    if (projectRows.length === 0) {
        return [];
    }

    const projectIds = projectRows.map((project) => project.id);

    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, project_id, status')
        .in('project_id', projectIds);

    if (tasksError) {
        throw tasksError;
    }

    const taskRows = (tasks ?? []) as ProjectTaskCountRow[];

    return projectRows.map((project) => calculateProjectStats(project, taskRows));
}

export async function createProject(
    input: CreateProjectInput
): Promise<Project> {
    const cleanedName = input.name.trim();

    if (!cleanedName) {
        throw new Error('Please enter a project name.');
    }

    const { data, error } = await supabase
        .from('projects')
        .insert({
            name: cleanedName,
            description: input.description?.trim() || null,
            outcome: input.outcome?.trim() || null,
            status: 'active',
        })
        .select(`
      id,
      user_id,
      name,
      outcome,
      description,
      status,
      deadline,
      created_at,
      updated_at,
      completed_at
    `)
        .single();

    if (error) {
        throw error;
    }

    return data as Project;
}

export async function archiveProject(projectId: string): Promise<Project> {
    const { data, error } = await supabase
        .from('projects')
        .update({
            status: 'archived',
        })
        .eq('id', projectId)
        .select(`
      id,
      user_id,
      name,
      outcome,
      description,
      status,
      deadline,
      created_at,
      updated_at,
      completed_at
    `)
        .single();

    if (error) {
        throw error;
    }

    return data as Project;
}