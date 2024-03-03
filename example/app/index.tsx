import { LineChart } from "@codeherence/react-native-graph";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Banner } from "../components/Banner";

export default () => {
  const { top, bottom } = useSafeAreaInsets();

  const data: [number, number][] = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => [i, Math.random() * 2000]);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      <LineChart
        points={data}
        style={styles.chart}
        BannerComponent={Banner}
        TopAxisLabel={() => <View />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  chart: { flex: 1, maxHeight: 200 },
});
