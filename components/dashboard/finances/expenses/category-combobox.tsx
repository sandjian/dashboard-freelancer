'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createCategory } from '@/lib/actions'; // Importamos la acción

type Category = {
  id: string;
  name: string;
};

export function CategoryCombobox({ initialCategories, onSelect, defaultValue }: { initialCategories: Category[], onSelect: (value: string) => void, defaultValue?: string | null }) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categories, setCategories] = React.useState(initialCategories);
  const [value, setValue] = React.useState(defaultValue || '');

  const handleCreateCategory = async () => {
    if (searchTerm) {
const newCategory = await createCategory(searchTerm) as Category;
      if (newCategory) {
        setCategories((current) => [...current, newCategory]);
        setValue(newCategory.id);
        onSelect(newCategory.id);
        setOpen(false);
      }
    }
  };

  const currentCategoryName = categories.find((cat) => cat.id === value)?.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className=" w-full justify-between text-neutral-500/80 text-xs font-medium  shadow-sm">
          {value ? currentCategoryName : 'Selecciona o crea una categoría...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[19rem] bg-white p-0">
        <Command>
          <CommandInput placeholder="Buscar o crear categoría..." className=' text-neutral-500/80 text-xs font-medium' onValueChange={setSearchTerm} />
          <CommandList>
            <CommandEmpty>
                <Button variant="ghost" className="w-full  text-black/70 text-xs font-medium transition-all hover:scale-110 duration-300" onClick={handleCreateCategory}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear {searchTerm}
                </Button>
            </CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                className=' text-black/70 text-xs font-medium transition-all duration-300 hover:bg-black/5' 
                key={category.id}
                  value={category.name}
                  onSelect={() => {
                    setValue(category.id);
                    onSelect(category.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === category.id ? 'opacity-100' : 'opacity-0')} />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}