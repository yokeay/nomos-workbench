'use client';

import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error }: { error: Error | null }) {
  const { t } = useTranslation();
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-foreground mb-2">{t('common.somethingWentWrong')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error?.message}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t('common.tryAgain')}
        </Button>
      </div>
    </div>
  );
}

export { ErrorBoundaryInner as ErrorBoundary };
