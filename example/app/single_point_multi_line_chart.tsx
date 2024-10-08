import { Line, MultiLineChart } from "@codeherence/react-native-graph";
import { Circle, Group } from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import { ScrollView, StyleSheet } from "react-native";
import { runOnJS, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const gestureStartImpact = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export default () => {
  const { bottom, left, right } = useSafeAreaInsets();

  const cursorShown = useSharedValue(false);
  const opacity = useDerivedValue(() => {
    return withTiming(cursorShown.value ? 1 : 0, { duration: 200 });
  });

  const msftX = useSharedValue(0);
  const msftY = useSharedValue(0);

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
        points={{ msft: [[1000, 0]] }}
        style={styles.chart}
        ExtraCanvasElements={
          <>
            <Group opacity={opacity}>
              <Circle cx={msftX} cy={msftY} r={4} color="purple" />
            </Group>
          </>
        }
        onPanGestureBegin={(payload) => {
          "worklet";
          cursorShown.value = true;
          msftX.value = payload.points.msft.x;
          msftY.value = payload.points.msft.y;
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
          console.log({ payload: payload.points.msft });
        }}
      >
        {(args) => (
          <>
            <Line points={args.points.msft} strokeWidth={1} color="purple" />
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
