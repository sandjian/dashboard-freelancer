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
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        danger:
          "border-danger text-danger [a&]:hover:bg-secondary/90",
        // La variante 'secondary' tenía colores de 'destructive', la ajusté a un color más neutral.
        // Si la intención era que fuera roja, puedes volver a ponerle los colores de 'destructive'.
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80",
        warning:
          "text-warning border-warning [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success: 
          "border-success text-success",
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