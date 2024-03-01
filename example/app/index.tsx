import { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LineChart } from "@codeherence/react-native-graph";
import { Banner } from "../components/Banner";

const GRAPH_HEIGHT_PROPORTION = 0.5;

export default () => {
  const { top, bottom } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const data: [number, number][] = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => [i, Math.random() * 200]);
  }, []);

  return (
    <View
      style={{
        paddingTop: top,
        paddingBottom: bottom,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LineChart
        points={data}
        width={width}
        height={height * GRAPH_HEIGHT_PROPORTION}
        BannerComponent={Banner}
      />
    </View>
  );
};
