import {
  type AxisLabelComponentProps,
  LineChart,
  type PanGestureHandlerOnChangeEventPayload,
  HoverGestureHandlerOnChangeEventPayload,
} from "@codeherence/react-native-graph";
import { LinearGradient, vec } from "@shopify/react-native-skia";
import { useCallback, useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useAnimatedProps, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AnimatedText from "../components/AnimatedText";

const generateRandomData = (): [number, number][] => {
  return Array.from({ length: 30 }, (_, i) => [i, Math.random() * 2000]);
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const AxisLabel: React.FC<AxisLabelComponentProps> = ({ value }) => (
  <Text>{formatter.format(value)}</Text>
);

const uiFormatter = (price: number) => {
  "worklet";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export default () => {
  const { top, bottom } = useSafeAreaInsets();
  const [data, setData] = useState<[number, number][]>([]);

  const latestPrice = useSharedValue("0");

  // Randomize the data
  const refreshData = useCallback(() => {
    const newData = generateRandomData();
    latestPrice.value = formatter.format(newData[newData.length - 1]![1]);
    setData(newData);
  }, []);

  useEffect(refreshData, []);

  const onHoverChangeWorklet = useCallback((evt: HoverGestureHandlerOnChangeEventPayload) => {
    "worklet";
    latestPrice.value = uiFormatter(evt.point);
  }, []);

  const onGestureChangeWorklet = useCallback((evt: PanGestureHandlerOnChangeEventPayload) => {
    "worklet";
    latestPrice.value = uiFormatter(evt.point);
  }, []);

  const onEndWorklet = useCallback(() => {
    "worklet";
    latestPrice.value = uiFormatter(data[data.length - 1]![1]);
  }, [data]);

  const animatedProps = useAnimatedProps(() => {
    return { text: latestPrice.value };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      <Button title="Randomize data" onPress={refreshData} />
      <AnimatedText style={styles.price} animatedProps={animatedProps} />
      <LineChart
        points={data}
        style={styles.chart}
        TopAxisLabel={AxisLabel}
        BottomAxisLabel={AxisLabel}
        onPanGestureChange={onGestureChangeWorklet}
        onPanGestureEnd={onEndWorklet}
        onHoverGestureEnd={onEndWorklet}
        onHoverGestureChange={onHoverChangeWorklet}
        strokeWidth={2}
        PathFill={({ width }) => (
          <LinearGradient start={vec(0, 0)} end={vec(width, 0)} colors={["blue", "yellow"]} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chart: { flex: 1 },
  price: { fontSize: 32 },
});
