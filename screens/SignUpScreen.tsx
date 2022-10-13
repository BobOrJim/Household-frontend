import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native";
import { Title } from "react-native-paper";
import { RootStackParamList } from "../NavContainer";
import { SignUpReply } from "../features/authentication/authenticationTypes";
import { useAppDispatch } from "../hooks/reduxHooks";
import { useState } from "react";

//Skall nog inte användas. Skall tjuvkolla på reactnative forms i puppy appen. :)
type SignUpFormType = {
  [fieldName: string]: string;
};

interface SignUpFormData {
  username: string;
  password: string;
  passwordConfirmation: string;
}

export default function SignUpScreen(Props: NativeStackScreenProps<RootStackParamList, "SignUp">) {
  const [fields, setFields] = useState<SignUpFormData>({
    username: "",
    password: "",
    passwordConfirmation: "",
  });
  const dispatch = useAppDispatch();

  //on submit something something...med RTK query
  //const reply: SignUpReplyType = await signUpHttpRequestAsync(dispatch, { username, email, password });

  return (
    <View>
      <Title>Hello from SignUpScreen</Title>
    </View>
  );
}
