'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createVendor } from '@/lib/actions'; // Importamos la acción
import type { Vendor } from '@/lib/definitions';

export function VendorCombobox({ initialVendors, onSelect, defaultValue }: { initialVendors: Vendor[], onSelect: (value: string) => void, defaultValue?: string | null }) {
  const [open, setOpen] = React.useState(false);
const [value, setValue] = React.useState(defaultValue || '');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [vendors, setVendors] = React.useState(initialVendors);

  const handleCreateVendor = async () => {
    if (searchTerm) {
      const newVendor = await createVendor(searchTerm) as Vendor;
      if (newVendor) {
        setVendors((current) => [...current, newVendor]);
        setValue(newVendor.id);
        onSelect(newVendor.id);
        setOpen(false);
      }
    }
  };

  const currentVendorName = vendors.find((v) => v.id === value)?.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className='relative' >
        <Button variant="outline" role="combobox" aria-expanded={open} className=" w-full justify-between text-neutral-500/80 text-xs font-medium  shadow-sm">
          {value ? currentVendorName : 'Selecciona o crea un proveedor...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[19rem] bg-white p-0">
        <Command>
          <CommandInput placeholder="Buscar o crear proveedor..." className=' text-neutral-500/80 text-xs font-medium' onValueChange={setSearchTerm} />
          <CommandList >
            <CommandEmpty>
                <Button variant="ghost" className="w-full  text-black/70 text-xs font-medium transition-all hover:scale-110 duration-300" onClick={handleCreateVendor}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear {searchTerm}
                </Button>
            </CommandEmpty>
            <CommandGroup>
              {vendors.map((vendor) => (
                <CommandItem
                className=' text-black/70 text-xs font-medium transition-all duration-300 hover:bg-black/5'
                  key={vendor.id}
                  value={vendor.name}
                  onSelect={() => {
                    setValue(vendor.id);
                    onSelect(vendor.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === vendor.id ? 'opacity-100' : 'opacity-0')} />
                  {vendor.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}