'use client';

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { X } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from './label';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [value, setValue] = useState(searchParams.get('query')?.toString() || '');

  useEffect(() => {
    setValue(searchParams.get('query')?.toString() || '');
  }, [searchParams]);

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

  const clearSearch = () => {
    setValue('');
    handleSearch('');
  };

  return (
    <Card className="flex-1 py-0 max-w-md w-full border-0 bg-transparent shadow-none">
      <CardContent className="p-0">
        <div className="relative">
          <Label htmlFor="search" className="sr-only text-sm">
            Search
          </Label>
          <Input
            id="search"
            className="h-10 pl-9 pr-9 text-sm rounded-xl border-0 bg-background/50 dark:bg-background/40 placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-teal-500/40 focus-visible:ring-offset-0 transition-all"
            placeholder={placeholder}
            onChange={(e) => {
              setValue(e.target.value);
              handleSearch(e.target.value);
            }}
            value={value}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground/70 pointer-events-none" />

          {value && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}