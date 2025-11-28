/**
 * Translates dynamic content from backend using translation keys.
 * Falls back to the original menuLabel if translation key is not found,
 * and also tries to derive a camelCase key from the provided label.
 * 
 * @param t - Translation function from useTranslations
 * @param translationKey - Optional key to look up in translations
 * @param fallback - Fallback text if translation key is not provided or not found
 * @returns Translated text or fallback
 */

function deriveKeyFromLabel(label: string): string | null {
    const words = label
        .replace(/[_-]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
        return null;
    }

    return words[0] + words.slice(1).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join("");
}

export function translateDynamic(
    t: (key: string) => string,
    translationKey: string | undefined,
    fallback: string
): string {
    const candidates: string[] = [];

    if (translationKey) {
        candidates.push(translationKey);
    }

    const derivedKey = deriveKeyFromLabel(fallback);
    if (derivedKey && derivedKey !== translationKey) {
        candidates.push(derivedKey);
    }

    for (const key of candidates) {
        try {
            const translated = t(key);
            if (translated && translated !== key) {
                return translated;
            }
        } catch {
            continue;
        }
    }

    return fallback;
}
