import { supabase } from './supabase';

export type Profile = {
    id: string;
    full_name: string | null;
    timezone: string;
    created_at: string;
    updated_at: string;
};

export async function getCurrentProfile(): Promise<Profile> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw userError;
    }

    if (!user) {
        throw new Error('You must be logged in to view your profile.');
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, timezone, created_at, updated_at')
        .eq('id', user.id)
        .single();

    if (error) {
        throw error;
    }

    return data as Profile;
}

export async function updateCurrentProfile({
    fullName,
    timezone,
}: {
    fullName: string;
    timezone: string;
}): Promise<Profile> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw userError;
    }

    if (!user) {
        throw new Error('You must be logged in to update your profile.');
    }

    const cleanedFullName = fullName.trim();
    const cleanedTimezone = timezone.trim();

    if (!cleanedTimezone) {
        throw new Error('Timezone cannot be empty.');
    }

    const { data, error } = await supabase
        .from('profiles')
        .update({
            full_name: cleanedFullName || null,
            timezone: cleanedTimezone,
        })
        .eq('id', user.id)
        .select('id, full_name, timezone, created_at, updated_at')
        .single();

    if (error) {
        throw error;
    }

    await supabase.auth.updateUser({
        data: {
            full_name: cleanedFullName || null,
            timezone: cleanedTimezone,
        },
    });

    return data as Profile;
}