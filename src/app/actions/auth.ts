'use server';

import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
    redirect('/map');
}

export async function signup(formData: FormData) {
    redirect('/map');
}
