import { sql } from '@vercel/postgres';
import { CalendarEvent } from '@/lib/definitions';
import { unstable_noStore as noStore } from 'next/cache';
import { resolveUserId } from '@/lib/auth-guard';

function normalizeCalendarEvent(row: CalendarEvent): CalendarEvent {
    return {
        ...row,
        start_time: new Date(row.start_time),
        end_time: new Date(row.end_time || row.start_time),
        created_at: new Date(row.created_at),
    };
}

export async function fetchEventsForMonth(userId?: string, year: number = new Date().getFullYear(), month: number = new Date().getMonth() + 1) {
    noStore();
    const uid = await resolveUserId(userId);
    try {
        const data = await sql<CalendarEvent>`
      SELECT 
        e.*,
        c.name as client_name,
        c.image_url as client_image_url
      FROM calendar_events e
      LEFT JOIN clients c ON e.related_client_id = c.id
      WHERE 
        e.user_id = ${uid}
        AND EXTRACT(YEAR FROM e.start_time) = ${year} 
        AND EXTRACT(MONTH FROM e.start_time) = ${month}
      ORDER BY e.start_time ASC
    `;
        return data.rows.map(normalizeCalendarEvent);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch calendar events.');
    }
}

export async function fetchUpcomingEvents(userId?: string, limit: number = 5) {
    noStore();
    const uid = await resolveUserId(userId);
    try {
        const data = await sql<CalendarEvent>`
      SELECT 
        e.*,
        c.name as client_name,
        c.image_url as client_image_url
      FROM calendar_events e
      LEFT JOIN clients c ON e.related_client_id = c.id
      WHERE 
        e.user_id = ${uid}
        AND e.start_time >= NOW()
      ORDER BY e.start_time ASC
      LIMIT ${limit}
    `;
        return data.rows.map(normalizeCalendarEvent);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch upcoming events.');
    }
}

export async function fetchAllEvents(userId?: string) {
    noStore();
    const uid = await resolveUserId(userId);
    try {
        const data = await sql<CalendarEvent>`
        SELECT 
          e.*,
          c.name as client_name,
          c.image_url as client_image_url
        FROM calendar_events e
        LEFT JOIN clients c ON e.related_client_id = c.id
        WHERE e.user_id = ${uid}
        ORDER BY e.start_time ASC
      `;
        return data.rows.map(normalizeCalendarEvent);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch all events.');
    }
}

export async function fetchEventById(id: string, userId?: string) {
    noStore();
    const uid = await resolveUserId(userId);
    try {
        const data = await sql<CalendarEvent>`
        SELECT 
          e.*,
          c.name as client_name,
          c.image_url as client_image_url
        FROM calendar_events e
        LEFT JOIN clients c ON e.related_client_id = c.id
        WHERE e.id = ${id} AND e.user_id = ${uid}
      `;
        return data.rows[0] ? normalizeCalendarEvent(data.rows[0]) : undefined;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch event.');
    }
}
