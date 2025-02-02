import React, { useState, useContext } from "react";
import { View, Text, Button, TextInput } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthContext } from "@/context/AuthContext";
import { RootStackParamList } from "@/types/types";

type SignInScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SignIn"
>;

interface Props {
  navigation: SignInScreenNavigationProp;
}

const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useContext(AuthContext);

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl mb-4">Sign In</Text>
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
      <Button title="Sign In" onPress={() => signIn({ username, password })} />
      <Button
        title="Don't have an account? Sign Up"
        onPress={() => navigation.navigate("SignUp")}
      />
    </View>
  );
};

export default SignInScreen;
