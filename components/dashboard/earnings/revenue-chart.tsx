'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

type MonthlyRevenueData = {
  month: string;
  earnings: number;
  expenses: number;
};
export function RevenueChart({ data }: { data: MonthlyRevenueData[] }) {
    return(

        <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
            <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            />
            <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
            />
            <Bar dataKey="earnings" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Ingresos" />
            <Bar dataKey="expenses" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} name="Gastos" />
        </BarChart>
        </ResponsiveContainer>
    )
  
}