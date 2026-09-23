import { sql } from '@vercel/postgres';
import { CalendarEvent } from '@/lib/definitions';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchEventsForMonth(year: number, month: number) {
    noStore();
    try {
        const data = await sql<CalendarEvent>`
      SELECT 
        e.*,
        c.name as client_name,
        c.image_url as client_image_url
      FROM calendar_events e
      LEFT JOIN clients c ON e.related_client_id = c.id
      WHERE 
        EXTRACT(YEAR FROM e.start_time) = ${year} 
        AND EXTRACT(MONTH FROM e.start_time) = ${month}
      ORDER BY e.start_time ASC
    `;
        return data.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch calendar events.');
    }
}

export async function fetchUpcomingEvents(limit: number = 5) {
    noStore();
    try {
        const data = await sql<CalendarEvent>`
      SELECT 
        e.*,
        c.name as client_name,
        c.image_url as client_image_url
      FROM calendar_events e
      LEFT JOIN clients c ON e.related_client_id = c.id
      WHERE e.start_time >= NOW()
      ORDER BY e.start_time ASC
      LIMIT ${limit}
    `;
        return data.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch upcoming events.');
    }
}

export async function fetchAllEvents() {
    noStore();
    try {
        const data = await sql<CalendarEvent>`
        SELECT 
          e.*,
          c.name as client_name,
          c.image_url as client_image_url
        FROM calendar_events e
        LEFT JOIN clients c ON e.related_client_id = c.id
        ORDER BY e.start_time ASC
      `;
        return data.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch all events.');
    }
}

export async function fetchEventById(id: string) {
    noStore();
    try {
        const data = await sql<CalendarEvent>`
        SELECT 
          e.*,
          c.name as client_name,
          c.image_url as client_image_url
        FROM calendar_events e
        LEFT JOIN clients c ON e.related_client_id = c.id
        WHERE e.id = ${id}
      `;
        return data.rows[0];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch event.');
    }
}

