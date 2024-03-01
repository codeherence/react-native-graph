import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { LineChart as LineChartImpl } from './LineChart';
import type { LineChartProps } from './LineChart';

type LoadState = 'loading' | 'loaded' | 'failed';

const loadSkia = async (): Promise<'loaded' | 'failed'> => {
  try {
    await LoadSkiaWeb();
    return 'loaded';
  } catch (error) {
    console.error(error);
    return 'failed';
  }
};

interface SkiaLoaderComponentProps {
  Component: React.ComponentType;
}

const SkiaLoaderComponent: React.FC<SkiaLoaderComponentProps> = ({
  Component,
}) => {
  const [skiaState, setSkiaState] = useState<LoadState>('loading');

  useEffect(() => {
    const doLoad = async () => {
      const result = await loadSkia();
      setSkiaState(result);
    };

    // Keep calling doLoad until it's loaded:
    if (skiaState === 'loading' || skiaState === 'failed') {
      setSkiaState('loading');
      doLoad();
    }
  }, [skiaState]);

  if (skiaState === 'loading' || skiaState === 'failed') {
    return <Text>Loading Skia...</Text>;
  }

  return <Component />;
};

export const LineChart: React.FC<LineChartProps> = (props) => {
  return <SkiaLoaderComponent Component={() => <LineChartImpl {...props} />} />;
};
