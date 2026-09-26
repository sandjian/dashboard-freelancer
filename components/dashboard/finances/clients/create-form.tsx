'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/actions';
import type { ClientState, Client } from '@/lib/definitions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/file-upload';
import { useTranslations } from 'next-intl';

export function ClientForm({ onSuccess, initialData, action, submitButtonText }: {
  onSuccess?: () => void;
  initialData?: Client;
  action?: (prevState: ClientState, formData: FormData) => Promise<ClientState>;
  submitButtonText?: string;
}) {
  const t = useTranslations('Clients');
  const initialState: ClientState = { message: null, errors: {} };
  // Use the passed action (for edit) or default createClient
  const actionToUse = action || createClient;

  const [state, formAction] = useActionState(actionToUse, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [imageBase64, setImageBase64] = useState<string>(initialData?.image_url || '');

  useEffect(() => {
    if (state.message?.includes('éxito')) {
      toast.success(initialData ? t('clientUpdatedToast') : t('clientCreatedToast'));
      if (!initialData) {
        formRef.current?.reset();
        setImageBase64(''); // Clear image preview on successful creation
      }
      if (onSuccess) onSuccess();
    } else if (state.message) {
      toast.error('Error', { description: state.message });
    }
  }, [state, onSuccess, initialData, t]);

  const handleImageChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageBase64(''); // Clear image if no file is selected
    }
  };

  const buttonText = submitButtonText || (initialData ? t('editClientButton') : t('createClientButton'));

  return (
    <form ref={formRef} action={formAction} className="w-full grid gap-6 p-1">

      {/* Hidden input for image */}
      <input type="hidden" name="image_url" value={imageBase64} />

      {/* Logo Upload Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t('brandLogo')}</label>
        <div className="flex flex-col gap-4">
          {initialData?.image_url && !imageBase64.startsWith('data:') && (
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
              <img src={initialData.image_url} alt="Current Logo" className="w-16 h-16 object-contain rounded-md" />
              <span className="text-sm text-muted-foreground">{t('currentLogo')}</span>
            </div>
          )}
          {imageBase64 && imageBase64.startsWith('data:') && (
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
              <img src={imageBase64} alt="New Logo Preview" className="w-16 h-16 object-contain rounded-md" />
              <span className="text-sm text-muted-foreground">{t('newImageSelected')}</span>
            </div>
          )}
          <FileUpload onChange={handleImageChange} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">{t('fullNameLabel')}</label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          placeholder={t('fullNamePlaceholder')}
          required
          aria-describedby="name-error"
          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.name &&
            state.errors.name.map((error: string) => (
              <p className="mt-1 text-xs text-destructive" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">{t('emailLabel')}</label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={initialData?.email || ''}
          placeholder={t('emailPlaceholder')}
          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-describedby="email-error"
        />
        <div id="email-error" aria-live="polite" aria-atomic="true">
          {state.errors?.email &&
            state.errors.email.map((error: string) => (
              <p className="mt-1 text-xs text-destructive" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="brand" className="text-sm font-medium">{t('brandLabel')}</label>
        <Input
          id="brand"
          name="brand"
          defaultValue={initialData?.brand || ''}
          placeholder={t('brandPlaceholder')}
          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">{t('phoneLabel')}</label>
        <Input
          id="phone"
          name="phone"
          defaultValue={initialData?.phone || ''}
          placeholder={t('phonePlaceholder')}
          className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          className="w-full mt-2 h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-white hover:text-white transition-all shadow-lg shadow-primary/20"
        >
          {buttonText}
        </Button>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {state.message && (
          <p className="mt-2 text-sm text-destructive text-center font-medium bg-destructive/10 p-2 rounded-md border border-destructive/20">{state.message}</p>
        )}
      </div>
    </form>
  );
}
