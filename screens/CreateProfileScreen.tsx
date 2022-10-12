import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native";
import { Title } from "react-native-paper";
import { RootStackParamList } from "../NavContainer";

export default function CreateProfileScreen(Props: NativeStackScreenProps<RootStackParamList, "CreateProfile">) {
    return (
        <View>
            <Title>Hello from CreateProfileScreen</Title>
        </View>
    )
}