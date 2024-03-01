import { Circle, Group, Line, vec } from '@shopify/react-native-skia';
import type { AnimatedProp, SkPath } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import type { BannerComponentProps } from './Banner';
import { getYForX } from './Math';

interface CursorProps {
  height: number;
  cursorRadius: number;
  path: SkPath | null;
  x: SharedValue<number>;
  BannerComponent: React.FC<BannerComponentProps> | null;
}

export const Cursor: React.FC<CursorProps> = ({
  cursorRadius,
  path,
  x,
  height,
  BannerComponent,
}) => {
  const y = useDerivedValue(
    () => (path ? getYForX(path, x.value, 2) ?? 0 : 0),
    [path]
  );

  const lineTransform = useDerivedValue(() => {
    return [{ translateX: x.value }];
  });

  const transform = useDerivedValue(() => {
    return [{ translateX: x.value }, { translateY: y.value }];
  }, []);

  const animatedText: AnimatedProp<string> = useDerivedValue(() => {
    return `$${y.value.toFixed(2)}`;
  });

  return (
    <>
      <Line
        transform={lineTransform}
        p1={vec(0, 0)}
        p2={vec(0, height)}
        color="black"
        strokeWidth={2}
      />
      <Group transform={transform}>
        {BannerComponent && BannerComponent({ text: animatedText })}
        <Circle cx={0} cy={0} r={cursorRadius} color="black" />
      </Group>
    </>
  );
};
