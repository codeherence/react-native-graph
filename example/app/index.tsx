import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

export default () => {
  const { navigate } = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => navigate("/chart")}>
        <Text style={styles.link}>Go to interactive chart</Text>
      </Pressable>
      <Pressable onPress={() => navigate("/static_chart")}>
        <Text style={styles.link}>Go to static chart</Text>
      </Pressable>
      <Pressable onPress={() => navigate("/multi_line_chart")}>
        <Text style={styles.link}>Go to multi line chart</Text>
      </Pressable>
      <Pressable onPress={() => navigate("/single_point_multi_line_chart")}>
        <Text style={styles.link}>Go to single point multi line chart</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
  },
  link: {
    color: "blue",
    fontSize: 16,
    textAlign: "center",
    padding: 16,
  },
});
