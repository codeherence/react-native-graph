import { type AxisLabelProps, LineChart } from "@codeherence/react-native-graph";
import { Paint } from "@shopify/react-native-skia";
import { useReducer } from "react";
import { Button, ScrollView, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { priceMap } from "../src/store/prices";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const AxisLabel: React.FC<AxisLabelProps> = ({ value }) => (
  <Text selectable={false}>{formatter.format(value)}</Text>
);

const priceMapKeys = Object.keys(priceMap) as (keyof typeof priceMap)[];

export default () => {
  const { bottom, left, right } = useSafeAreaInsets();
  const [counter, increment] = useReducer((s: number) => s + 1, 0);

  const symbol = priceMapKeys[counter % priceMapKeys.length]!;
  const data = priceMap[symbol];

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
      <Button title={`Showing ${symbol}. Press to switch.`} onPress={increment} />
      <LineChart
        isStatic
        points={data}
        style={styles.chart}
        TopAxisLabel={AxisLabel}
        BottomAxisLabel={AxisLabel}
        strokeWidth={2}
        PathFill={({ strokeWidth }) => (
          <Paint style="stroke" strokeWidth={strokeWidth} color="lightblue" />
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flexGrow: 1 },
  chart: { flex: 1, maxHeight: 300 },
  price: { fontSize: 32 },
});
