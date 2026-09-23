export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'generic';

export interface CardNetworkDetails {
    network: CardNetwork;
    name: string;
    maxLength: number;
    cvvLength: number;
    formatGroups: number[];
}

/**
 * Detect card network based on prefix (BIN):
 * - Visa: starts with 4
 * - Mastercard: starts with 51-55 or 2221-2720
 * - American Express: starts with 34 or 37
 * - Generic fallback
 */
export function detectCardNetwork(cardNumber: string): CardNetworkDetails {
    const cleanNumber = cardNumber.replace(/\D/g, '');

    // American Express: 34 or 37
    if (/^3[47]/.test(cleanNumber)) {
        return {
            network: 'amex',
            name: 'American Express',
            maxLength: 15,
            cvvLength: 4,
            formatGroups: [4, 6, 5],
        };
    }

    // Visa: 4
    if (/^4/.test(cleanNumber)) {
        return {
            network: 'visa',
            name: 'Visa',
            maxLength: 16,
            cvvLength: 3,
            formatGroups: [4, 4, 4, 4],
        };
    }

    // Mastercard: 51-55 or 2221-2720
    const twoDigits = parseInt(cleanNumber.slice(0, 2), 10);
    const fourDigits = parseInt(cleanNumber.slice(0, 4), 10);

    if (
        (twoDigits >= 51 && twoDigits <= 55) ||
        (fourDigits >= 2221 && fourDigits <= 2720)
    ) {
        return {
            network: 'mastercard',
            name: 'Mastercard',
            maxLength: 16,
            cvvLength: 3,
            formatGroups: [4, 4, 4, 4],
        };
    }

    // Fallback Generic
    return {
        network: 'generic',
        name: 'Tarjeta',
        maxLength: 16,
        cvvLength: 3,
        formatGroups: [4, 4, 4, 4],
    };
}

/**
 * Format raw digits with spaces according to the network (e.g. 4-4-4-4 for Visa/Mastercard, 4-6-5 for Amex)
 */
export function formatCardNumberByNetwork(value: string, network: CardNetwork = 'generic'): string {
    const digits = value.replace(/\D/g, '');

    if (network === 'amex') {
        const part1 = digits.slice(0, 4);
        const part2 = digits.slice(4, 10);
        const part3 = digits.slice(10, 15);

        if (part3) return `${part1} ${part2} ${part3}`;
        if (part2) return `${part1} ${part2}`;
        return part1;
    }

    // Standard 4-4-4-4
    const clamped = digits.slice(0, 16);
    const parts = clamped.match(/.{1,4}/g);
    return parts ? parts.join(' ') : clamped;
}
