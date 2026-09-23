import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
// 1. Importar los íconos que necesitas
import { Clock, XCircle, CheckCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Tus estilos de cva no cambian...
  "inline-flex items-center justify-center rounded-lg border px-3 py-1 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "font-normal text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
        danger:
          "font-normal text-xs bg-transparent text-destructive border-destructive hover:bg-destructive/10",
        secondary:
          "font-normal text-xs bg-transparent text-muted-foreground border-border hover:bg-secondary/50",
        warning:
          "font-normal text-xs bg-transparent text-warning border-warning hover:bg-warning/10",
        success:
          "font-normal text-xs bg-gradient-to-r from-teal-500/15 via-teal-900/30 to-black/40 text-teal-400 dark:text-teal-300 border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.15)]",
        outline:
          "font-normal text-xs bg-black/10 text-slate-200 border-cyan-700 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// 2. Crear un mapa para asociar variantes con íconos
const variantIconMap: Record<NonNullable<VariantProps<typeof badgeVariants>["variant"]>, React.ElementType | null> = {
  warning: Clock,
  danger: XCircle,
  success: CheckCircle,
  default: null, // Sin ícono para 'default'
  secondary: null, // Sin ícono para 'secondary'
  outline: null,
}


function Badge({
  className,
  variant,
  asChild = false,
  children, // Desestructuramos children para tener control sobre su posición
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  // 3. Obtener el componente del ícono desde el mapa
  const Icon = variant ? variantIconMap[variant] : null

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {/* 4. Renderizar el ícono si existe */}
      {Icon && <Icon />}
      {/* Renderizar el contenido del badge */}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }