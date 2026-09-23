'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function registerUser(formData: FormData) {
    const validatedFields = RegisterSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
            error: 'Invalid fields. Please check your input.',
        };
    }

    const { name, email, password } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Check if user exists
        const existingUser = await sql`SELECT * FROM users WHERE email=${email}`;
        if (existingUser.rows.length > 0) {
            return { error: 'User with this email already exists.' };
        }

        await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;
    } catch (error) {
        console.error('Database Error:', error);
        return {
            error: 'Failed to create user. Please try again.',
        };
    }

    redirect('/login');
}
