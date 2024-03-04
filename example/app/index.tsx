import { type AxisLabelComponentProps, LineChart } from "@codeherence/react-native-graph";
import { useCallback, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LineChartProps } from "src/components/LineChart";

const generateRandomData = (): [number, number][] => {
  return Array.from({ length: 30 }, (_, i) => [i, Math.random() * 2000]);
};

type FilterUndefined<T> = T extends undefined ? never : T;

const onGestureChangeWorklet: FilterUndefined<LineChartProps["onPanGestureChange"]> = ({
  point,
}) => {
  "worklet";
  console.log(point);
};

const onHoverChangeWorklet: FilterUndefined<LineChartProps["onHoverGestureChange"]> = ({
  point,
}) => {
  "worklet";
  console.log(point);
};

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const AxisLabel: React.FC<AxisLabelComponentProps> = ({ value }) => (
  <Text>{formatter.format(value)}</Text>
);

export default () => {
  const { top, bottom } = useSafeAreaInsets();
  const [data, setData] = useState<[number, number][]>(generateRandomData());

  // Randomize the data
  const handlePress = useCallback(() => setData(generateRandomData()), []);

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      <Button title="Randomize data" onPress={handlePress} />
      <LineChart
        points={data}
        style={styles.chart}
        TopAxisLabel={AxisLabel}
        BottomAxisLabel={AxisLabel}
        onPanGestureChange={onGestureChangeWorklet}
        onHoverGestureChange={onHoverChangeWorklet}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chart: { flex: 1, maxHeight: "40%" },
});
