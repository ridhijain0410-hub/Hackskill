import { LanguageCode, LanguageConfig } from '../types';

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechLang: 'en-IN',
    scriptLabel: 'English',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechLang: 'hi-IN',
    scriptLabel: 'हिन्दी (Hindi)',
  },
];

export function getLanguageConfig(code: LanguageCode): LanguageConfig {
  return (
    SUPPORTED_LANGUAGES.find((lang) => lang.code === code) ||
    SUPPORTED_LANGUAGES[0]
  );
}

export function getLanguageName(code: LanguageCode): string {
  const config = getLanguageConfig(code);
  return config.name;
}
