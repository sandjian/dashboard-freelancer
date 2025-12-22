import { fetchCards } from '@/lib/data'; // Necesitarás crear esta función
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateCardForm } from '@/components/dashboard/finances/cards/create-form';
import { Card as UICard, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function CardsPage() {
  const cards = await fetchCards();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Tarjetas</h1>
        <Dialog>
          <DialogTrigger asChild><Button>Añadir Tarjeta</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Registrar Nueva Tarjeta</DialogTitle></DialogHeader><CreateCardForm /></DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => (
          <UICard key={card.id}>
            <CardHeader>
              <CardTitle>{card.name}</CardTitle>
              <CardDescription>Terminada en {card.last_four_digits}</CardDescription>
            </CardHeader>
          </UICard>
        ))}
      </div>
    </div>
  );
}