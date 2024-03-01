import { BannerComponentProps } from "@codeherence/react-native-graph";
import { Text, useFont } from "@shopify/react-native-skia";

const robotoMedium = require("../public/fonts/Roboto/Roboto-Medium.ttf");

export const Banner: React.FC<BannerComponentProps> = (props) => {
  const font = useFont(robotoMedium, 24);
  return <Text x={0} y={0} font={font} text={props.text} />;
};
