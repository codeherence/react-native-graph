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
        <Text style={styles.link}>Go to Charts</Text>
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
