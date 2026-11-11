import { useState } from 'react';

import { LanguageSwitch } from '@/components/LanguageSwitch';
import { RiskCards } from '@/components/RiskCards';
import { Button, CheckRow, Screen, Txt } from '@/components/ui';
import { t } from '@/i18n';
import { useDisclaimer } from '@/state/disclaimer';

export default function Onboarding() {
  const { accept } = useDisclaimer();
  const [checked, setChecked] = useState(false);

  return (
    <Screen noHeader>
      <LanguageSwitch />
      <Txt variant="display">{t('onboarding.title')}</Txt>
      <Txt>{t('onboarding.intro')}</Txt>
      <Txt variant="h2">{t('onboarding.risksTitle')}</Txt>
      <RiskCards />
      <CheckRow
        label={t('onboarding.accept')}
        checked={checked}
        onToggle={() => setChecked((value) => !value)}
      />
      <Button label={t('onboarding.continue')} onPress={accept} disabled={!checked} />
    </Screen>
  );
}
