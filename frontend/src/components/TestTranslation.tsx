import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function TestTranslation() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    console.log('Current language:', i18n.language);
    console.log('Translation test:', t('dashboard.provider.welcome', { name: 'Test' }));
    console.log('Available languages:', i18n.languages);
    console.log('Resources loaded:', i18n.hasResourceBundle(i18n.language, 'translation'));
  }, [i18n, t]);

  return (
    <div className="p-4 bg-yellow-100 border-2 border-yellow-500">
      <h2>Translation Test Component</h2>
      <p>Current Language: {i18n.language}</p>
      <p>Test Key (dashboard.provider.welcome): {t('dashboard.provider.welcome', { name: 'User' })}</p>
      <p>Simple Key (auth.login): {t('auth.login')}</p>
      <button 
        onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
      >
        Switch to {i18n.language === 'ar' ? 'English' : 'العربية'}
      </button>
    </div>
  );
}
