import { en } from './locales/en';
import { tr } from './locales/tr';
import { ru } from './locales/ru';

export type Language = 'en' | 'tr' | 'ru';

const translations = {
  en,
  tr,
  ru,
};

// Tip tanımlamaları
export type TranslationKey = keyof typeof en;
export type NestedTranslationKey<T extends TranslationKey> = keyof typeof en[T];

/**
 * Belirli bir dil için çeviri string'ini döndürür
 * @param language Kullanılacak dil
 * @param key Ana çeviri anahtarı
 * @param nestedKey İç içe geçmiş çeviri anahtarı
 * @returns Çevrilmiş metin
 */
export function translate<T extends TranslationKey>(
  language: Language,
  key: T,
  nestedKey: keyof typeof en[T]
): string {
  // Dil mevcutsa kullan, yoksa İngilizce'ye geri dön
  const lang = translations[language] || translations.en;
  
  try {
    // @ts-ignore - TypeScript'in iç içe yapıları anlaması için yok sayıyoruz
    if (lang[key] && lang[key][nestedKey]) {
      // @ts-ignore
      return lang[key][nestedKey];
    }
    // Eğer çeviri bulunamazsa, İngilizce'yi dene
    // @ts-ignore
    return en[key][nestedKey] || `${key}.${nestedKey}`;
  } catch (error) {
    // Herhangi bir hata durumunda anahtar string'ini döndür
    return `${key}.${String(nestedKey)}`;
  }
}

/**
 * Mevcut dillerin listesini döndürür
 */
export function getAvailableLanguages(): { code: Language; name: string }[] {
  return [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ru', name: 'Русский' },
  ];
}

export default {
  translate,
  getAvailableLanguages,
}; 