import { useEffect } from 'react';
import type { InvoiceState } from './definitions'; // Ajusta el tipo según el formulario

// Este hook recibe los errores del estado del formulario
export function useFormScrollOnError(errors: InvoiceState['errors']) {
  useEffect(() => {
    // Si no hay errores, no hacemos nada
    if (!errors || Object.keys(errors).length === 0) {
      return;
    }

    // Buscamos el primer elemento del DOM que tenga un mensaje de error
    const firstErrorElement = document.querySelector('[data-form-error="true"]');

    if (firstErrorElement) {
      // Si lo encontramos, hacemos scroll suavemente hacia él
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errors]); // Este efecto se ejecuta cada vez que el objeto de errores cambia
}