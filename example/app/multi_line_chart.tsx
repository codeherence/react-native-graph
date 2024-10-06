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
  const { bottom, left, right } = useSafeAreaInsets();

  const cursorShown = useSharedValue(false);
  const opacity = useDerivedValue(() => {
    // return cursorShown.value ? 1 : 0;
    // Use a timing function to animate the opacity
    return withTiming(cursorShown.value ? 1 : 0, { duration: 200 });
  });

  const msftX = useSharedValue(0);
  const msftY = useSharedValue(0);
  const aaplX = useSharedValue(0);
  const aaplY = useSharedValue(0);
  const nvdaX = useSharedValue(0);
  const nvdaY = useSharedValue(0);
  const unityX = useSharedValue(0);
  const unityY = useSharedValue(0);

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
        ExtraCanvasElements={
          <>
            <Group opacity={opacity}>
              <Circle cx={msftX} cy={msftY} r={4} color="purple" />
              <Circle cx={aaplX} cy={aaplY} r={4} color="green" />
              <Circle cx={nvdaX} cy={nvdaY} r={4} color="black" />
              <Circle cx={unityX} cy={unityY} r={4} color="orange" />
            </Group>
          </>
        }
        onPanGestureBegin={(payload) => {
          "worklet";
          cursorShown.value = true;
          msftX.value = payload.points.msft.x;
          msftY.value = payload.points.msft.y;
          aaplX.value = payload.points.aapl.x;
          aaplY.value = payload.points.aapl.y;
          nvdaX.value = payload.points.nvda.x;
          nvdaY.value = payload.points.nvda.y;
          unityX.value = payload.points.unity.x;
          unityY.value = payload.points.unity.y;
          runOnJS(gestureStartImpact)();
        }}
        onPanGestureEnd={() => {
          "worklet";
          cursorShown.value = false;
        }}
        onPanGestureChange={(payload) => {
          "worklet";
          msftX.value = payload.points.msft.x;
          msftY.value = payload.points.msft.y;
          aaplX.value = payload.points.aapl.x;
          aaplY.value = payload.points.aapl.y;
          nvdaX.value = payload.points.nvda.x;
          nvdaY.value = payload.points.nvda.y;
          unityX.value = payload.points.unity.x;
          unityY.value = payload.points.unity.y;
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
