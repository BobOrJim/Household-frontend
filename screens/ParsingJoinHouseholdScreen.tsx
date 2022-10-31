import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, ProgressBar, Text } from "react-native-paper";
import { Household } from "../features/household/householdTypes";
import { RootStackParamList } from "../NavContainer";

export default function ParsingJoinHouseholdScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "ParsingJoinHousehold">) {
  const {
    handleSubmit,
    formState: {},
  } = useForm();

  const [household, setHousehold] = useState<Household>();
  const [foundHouseholdBool, setHouseholdFound] = useState(false);
  const [searching, setSearching] = useState(true);

  useEffect(() => {
    (async function getHousehold() {
      console.log("Initiate fetch...");
      const response = await fetch(
        "https://household-backend.azurewebsites.net/api/V01/household/GetHouseholdByHouseholdCode/" +
          route.params.householdCode,
      );
      console.log("Fetch complete");
      if (response.ok) {
        console.log("Response OK. Setting values...");
        setSearching(false);
        setHousehold(await response.json());
        setHouseholdFound(true);
      } else {
        console.log("Fetch failed.");
        setSearching(false);
      }
    })();
  }, [route.params.householdCode]);

  const onJoinHouseholdPressed = () => {
    // TODO Join a household, send request to admin, etc
  };

  return (
    <View style={styles.container}>
      {!foundHouseholdBool && searching && (
        <>
          <Text>Searching...</Text>
          <ProgressBar indeterminate={true} style={{ width: "50%" }} />
        </>
      )}
      {!foundHouseholdBool && !searching && (
        <>
          <Text style={styles.title}>
            No household by the code {route.params.householdCode} was found!
          </Text>

          <Button
            mode='contained'
            style={styles.cancelBtn}
            onPress={() => {
              navigation.goBack();
            }}
          >
            Return & Try Again
          </Button>
        </>
      )}
      {foundHouseholdBool && !searching && (
        <>
          <Text variant='titleMedium'>You have successfully joined</Text>
          <Text variant='headlineMedium' style={{ textAlign: "center" }}>
            {household?.name}
          </Text>

          <Button
            mode='contained'
            onPress={handleSubmit(onJoinHouseholdPressed)}
            style={{ marginTop: 100 }}
          >
            Awesome!
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
  },
  cancelBtn: {
    position: "absolute",
    bottom: 30,
  },
});
