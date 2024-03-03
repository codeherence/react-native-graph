import { Circle, Group, Line, vec } from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import type { DerivedValue, SharedValue } from "react-native-reanimated";

interface CursorProps {
  x: SharedValue<number>;
  y: DerivedValue<number>;
  height: number;
  cursorRadius: number;
}

export const Cursor: React.FC<CursorProps> = ({ x, y, height, cursorRadius }) => {
  const lineTransform = useDerivedValue(() => {
    return [{ translateX: x.value }];
  });

  const transform = useDerivedValue(() => {
    return [{ translateX: x.value }, { translateY: y.value }];
  }, []);

  // const animatedText: AnimatedProp<string> = useDerivedValue(() => {
  //   // Must interpolate the y value to the proper value
  //   const interpolatedY = interpolate(
  //     y.value,
  //     [cursorRadius, height + cursorRadius],
  //     [maxValue, minValue]
  //   );
  //   return formatter(interpolatedY);
  // }, [maxValue, minValue, height, formatter]);

  // const bannerTransform = useDerivedValue(() => {
  //   return [{ translateX: cursorRadius }, { translateY: -cursorRadius - BASE_LABEL_MARGIN }];
  // });

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
        {/* {BannerComponent && (
          <Group transform={bannerTransform} style="fill" color="red">
            {BannerComponent({ text: animatedText })}
          </Group>
        )} */}
        <Circle cx={0} cy={0} r={cursorRadius} color="black" />
      </Group>
    </>
  );
};
