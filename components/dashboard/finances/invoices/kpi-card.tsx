"use client"

import * as React from "react"
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { FileTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'

const iconMap = {
  total: FileTextIcon,
  facturado: CheckCircleIcon,
  pendiente: ClockIcon,
  vencido: XCircleIcon,
}

// Creamos un tipo para los colores semánticos que definiste en tu CSS
type KpiColor = 'info' | 'success' | 'warning' | 'danger';

interface KpiCardProps {
  title: string
  count: number
  amount: number
  percentage?: number
  iconName: keyof typeof iconMap
  color: KpiColor // Usamos el nuevo tipo de color
}

export function InvoiceKpiCard({ title, count, amount, percentage, iconName, color }: KpiCardProps) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const chartData = React.useMemo(() => [{
    name: title,
    value: Math.min(percentage ?? 0, 100)
  }], [title, percentage])

  const Icon = iconMap[iconName]

  // 3. Renderizado condicional para evitar discrepancia SSR/CSR
  if (!isMounted) {
    return (
      <Card>
        <CardContent className="p-4 grid grid-cols-3 items-center gap-4">
          <div className="col-span-1 flex justify-center">
            <div className="w-[70px] h-[70px] rounded-full bg-muted animate-pulse" />
          </div>
          <div className="col-span-2 space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-6 w-full bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
     <Card style={{ '--chart-color': `var(--${color})` } as React.CSSProperties}>
      <CardContent className="p-4 grid grid-cols-5 items-center justify-center gap-4">
        {/* Gráfico Radial */}
        <div className="col-span-2 flex justify-center ">
          <div className="w-[80px] h-[80px] relative">
            <RadialBarChart
              width={80} height={80} cx={40} cy={40}
              innerRadius="80%" outerRadius="100%" barSize={8}
              data={chartData} startAngle={90} endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                // 👇 2. La barra del gráfico ahora usa nuestra variable CSS
                fill="var(--chart-color)"
              />
            </RadialBarChart>
            
            {/* Icono centrado */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {/* 👇 3. El ícono también usa la misma variable CSS */}
              <Icon className="w-5 h-5 text-[var(--chart-color)]" />
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="col-span-3 flex flex-col  space-y-1 ">
          <p className="text-sm font-medium text-muted-foreground ">{title}</p>
          <p className="font-semibold text-foreground">{formatCurrency(amount)}</p>
          <p className="text-xs text-muted-foreground">{count} {count === 1 ? 'factura' : 'facturas'}</p>
        </div>
      </CardContent>
    </Card>
  )
}