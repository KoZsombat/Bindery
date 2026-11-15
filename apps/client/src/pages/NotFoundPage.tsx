import { useNavigate } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export function NotFoundPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl items-center px-4 py-8 sm:px-6">
      <div className="w-full">
        <EmptyState
          title={t('Page not found.')}
          description={t('Something went wrong')}
          action={<Button onClick={() => navigate('/app')}>{t('Back to sites')}</Button>}
        />
      </div>
    </div>
  );
}
