import { Line, MultiLineChart } from "@codeherence/react-native-graph";
import { Circle, Group } from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { ScrollView, StyleSheet } from "react-native";
import { runOnJS, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { priceMap } from "../src/store/prices";

const gestureStartImpact = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export default () => {
  const cursorShown = useSharedValue(false);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const { bottom, left, right } = useSafeAreaInsets();

  const opacity = useDerivedValue(() => {
    // return cursorShown.value ? 1 : 0;
    // Use a timing function to animate the opacity
    return withTiming(cursorShown.value ? 1 : 0, { duration: 200 });
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingBottom: bottom,
          paddingLeft: left,
          paddingRight: right,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <MultiLineChart
        isStatic={false}
        points={priceMap}
        style={styles.chart}
        // ExtraCanvasElements={
        //   <>
        //     <Group color="blue" opacity={opacity}>
        //       <Circle cx={x} cy={y} r={10} />
        //     </Group>
        //   </>
        // }
        onPanGestureBegin={(payload) => {
          "worklet";
          cursorShown.value = true;
          x.value = payload.event.x;
          y.value = payload.event.y;
          runOnJS(gestureStartImpact)();
        }}
        onPanGestureEnd={() => {
          "worklet";
          cursorShown.value = false;
        }}
        onPanGestureChange={(payload) => {
          "worklet";
          x.value = payload.event.x;
          y.value = payload.event.y;
        }}
      >
        {(args) => (
          <>
            <Line points={args.points.aapl} strokeWidth={1} color="green" />
            <Line points={args.points.msft} strokeWidth={1} color="purple" />
            <Line points={args.points.nvda} strokeWidth={1} color="black" />
            <Line points={args.points.unity} strokeWidth={1} color="orange" />
          </>
        )}
      </MultiLineChart>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flexGrow: 1 },
  chart: { flex: 1, maxHeight: 200 },
  price: { fontSize: 32 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
  },
  toggleBtn: {
    padding: 12,
    backgroundColor: "blue",
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
