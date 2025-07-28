// app/not-found.tsx
import Link from 'next/link';
 
export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <h2 className="text-xl font-semibold">404 No Encontrado</h2>
      <p>No se pudo encontrar el recurso solicitado.</p>
      <Link
        href="/dashboard"
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Volver al Dashboard
      </Link>
    </main>
  );
}