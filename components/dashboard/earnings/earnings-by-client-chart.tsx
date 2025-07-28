'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

type ChartData = {
  client: string;
  total: number;
};
export function EarningsByClientChart({ data }: { data: ChartData[] }) {
  // Convertimos los totales a números
  const validData = data?.map(item => ({
    client: item.client,
    total: Number(item.total) // Conversión explícita
  })).filter(item => !isNaN(item.total)) || []; // Filtramos NaN por seguridad

  if (!validData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingresos por Cliente (Mes)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <p className="text-muted-foreground">No hay datos válidos de ingresos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos por Cliente (Mes)</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={validData}
              dataKey="total"
              nameKey="client"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ client, percent }) => `${client}: ${(percent * 100).toFixed(0)}%`}
            >
              {validData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => 
                new Intl.NumberFormat('es-AR', { 
                  style: 'currency', 
                  currency: 'ARS' 
                }).format(value)
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}