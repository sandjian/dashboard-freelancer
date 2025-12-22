'use client';

import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card'; // Importamos Card
import { Input } from '@/components/ui/input'; // Usamos el Input de shadcn
import { Label } from './label';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    // 👇 1. Envolvemos todo en un Card
    <Card className="flex-1 py-1 max-w-md w-full ">
      <CardContent >
        <div className="relative">
          <Label htmlFor="search" className="sr-only text-sm">
            Search
          </Label>
          {/* 👇 2. Usamos el componente Input de shadcn y ajustamos sus estilos */}
          <Input
            id="search"
            className="h-9 pl-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder={placeholder}
            onChange={(e) => {
              handleSearch(e.target.value);
            }}
            defaultValue={searchParams.get('query')?.toString()}
          />
          <MagnifyingGlassIcon className="absolute left-1 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
        </div>
      </CardContent>
    </Card>
  );
}