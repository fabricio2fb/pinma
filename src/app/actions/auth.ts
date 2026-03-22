'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
    const supabase = await createClient();
    const loginInput = formData.get('login') as string;
    const password = formData.get('password') as string;

    let email = loginInput;

    // Se o input não for email (não contém @), buscamos o e-mail pelo username no perfil
    if (!loginInput.includes('@')) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('full_name', loginInput) // O full_name guarda o username @
            .single();
        
        if (profile?.email) {
            email = profile.email;
        }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/map');
}

export async function signup(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: username,
            }
        }
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/map');
}
