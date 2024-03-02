import { Circle, Group, Line, vec } from "@shopify/react-native-skia";
import type { AnimatedProp, SkPath } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

import type { BannerComponentProps } from "./Banner";
import { type GetYForXProps, getYForX } from "./Math";

interface CursorProps {
  height: number;
  cursorRadius: number;
  path: SkPath | null;
  x: SharedValue<number>;
  BannerComponent: React.FC<BannerComponentProps> | null;
  curveType: GetYForXProps["curveType"];
}

const BASE_LABEL_MARGIN = 8;

export const Cursor: React.FC<CursorProps> = ({
  cursorRadius,
  path,
  x,
  height,
  curveType,
  BannerComponent,
}) => {
  const y = useDerivedValue(
    () => (path ? getYForX({ path, x: x.value, curveType }) ?? 0 : 0),
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

  const bannerTransform = useDerivedValue(() => {
    return [{ translateX: cursorRadius }, { translateY: -cursorRadius - BASE_LABEL_MARGIN }];
  });

  return (
    <>
      <Line
        transform={lineTransform}
        p1={vec(0, 0)}
        p2={vec(0, height)}
        color="rgba(0, 0, 0, 0.5)"
        strokeWidth={2}
      />
      <Group transform={transform}>
        {BannerComponent && (
          <Group transform={bannerTransform} style="fill" color="red">
            {BannerComponent({ text: animatedText })}
          </Group>
        )}
        <Circle cx={0} cy={0} r={cursorRadius} color="black" />
      </Group>
    </>
  );
};
