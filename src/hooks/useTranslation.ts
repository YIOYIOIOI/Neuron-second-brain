import { useStore } from '../store/useStore';
import { i18n, I18nKey } from '../i18n';

export function useTranslation() {
  const { language } = useStore();

  const t = (key: I18nKey) => {
    return i18n[language][key] || key;
  };

  return { t, language };
}
