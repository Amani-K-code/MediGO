import { TouchableOpacity, Text } from "react-native";

export default function PrimaryButton({
  title,
  onPress,
  style,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: "#0057B8",
          padding: 16,
          borderRadius: 16,
          alignItems: "center",
        },
        style,
      ]}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}