import React, { useState, useContext } from "react";
import { View, Text, Button, TextInput } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthContext } from "@/context/AuthContext";
import { RootStackParamList } from "@/types/types";

type SignUpScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SignUp"
>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { signUp } = useContext(AuthContext);

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl mb-4">Sign Up</Text>
      <TextInput
        className="border border-gray-300 p-2 rounded w-full mb-2"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        className="border border-gray-300 p-2 rounded w-full mb-2"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign Up" onPress={() => signUp({ username, password })} />
      <Button
        title="Already have an account? Sign In"
        onPress={() => navigation.navigate("SignIn")}
      />
    </View>
  );
};

export default SignUpScreen;
