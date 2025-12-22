'use client';

import { Button } from '@/components/ui/button';
import { PrinterIcon } from 'lucide-react';

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handlePrint}
    >
      <PrinterIcon className="w-4 mr-2" /> Imprimir
    </Button>
  );
}