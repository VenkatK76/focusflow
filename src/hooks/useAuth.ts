import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type UseAuthResult = {
    session: Session | null;
    user: User | null;
    loading: boolean;
};

export function useAuth(): UseAuthResult {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function loadSession() {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error loading Supabase session:', error);
            }

            if (isMounted) {
                setSession(data.session);
                setLoading(false);
            }
        }

        loadSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return {
        session,
        user: session?.user ?? null,
        loading,
    };
}