import { supabase } from "./supabase";

export type SignUpInput = {
    email: string;
    password: string;
    fullName?: string;
};

export type SignInInput = {
    email: string;
    password: string;
};

export async function signUpWithEmail({
    email,
    password,
    fullName,
}: SignUpInput) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName ?? null,
                timezone,
            },
        },
    });

    if (error) {
        throw error;
    }

    return data;
}

export async function signInWithEmail({
    email,
    password,
}: SignInInput) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}