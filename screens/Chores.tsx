import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { FlatList, StyleSheet, TouchableHighlight, View } from "react-native";
import { Button, Text, Title } from "react-native-paper";
import ChoreListItem from "../components/ChoreListItem";
import { selectChores } from "../features/chore/choreSelectors";
import { selectHousehold } from "../features/household/householdSelectors";
import { useAppSelector } from "../hooks/reduxHooks";
import { RootStackParamList } from "../NavContainer";
//import { TopTabParamsList } from "../navigation/TopTabsNavigator";

//type Props = NativeStackScreenProps<RootStackParamList>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ChoresScreen(Props: NativeStackScreenProps<RootStackParamList>) {
  const [editableMode, setEditableMode] = useState(true);
  const household = useAppSelector(selectHousehold);
  const chores = useAppSelector(selectChores);


  const onAddChorePressed = () => {
    Props.navigation.navigate("AddChore");
  };

  const toggleIsEditable = () => {
    setEditableMode((current: boolean) => !current);
    console.log(editableMode);
  };

  return (
    <>
      <View>
        <Title>Chore Screen</Title>
        <Text>{household.name}</Text>
        <View style={{ justifyContent: "center", height: 200 }}>
          <FlatList
            data={chores}
            renderItem={({ item }) => (
              <TouchableHighlight>
                <View>
                  <ChoreListItem
                    chore={item}
                    navigation={Props.navigation}
                    editableMode={editableMode}
                  ></ChoreListItem>
                </View>
              </TouchableHighlight>
            )}
          />
        </View>

        <View style={styles.container}></View>
        <View style={{ flexDirection: "row" }}>
          <Button
            style={{
              width: "50%",
              alignSelf: "flex-end",
              justifyContent: "flex-end",
              backgroundColor: "hotpink",
            }}
            onPress={onAddChorePressed}
          >
            <Text>Add Chore</Text>
          </Button>
          <Button
            style={{
              width: "50%",
              alignSelf: "flex-end",
              justifyContent: "flex-end",
            }}
            onPress={toggleIsEditable}
          >
            <Text
              style={{
                color: "black",
                alignSelf: "center",
                justifyContent: "center",
              }}
            >
              Edit Chore
            </Text>
          </Button>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    backgroundColor: "white",
  },
  card: {},
  button: { backgroundColor: "hotpink" },
  input: { backgroundColor: "brown" },
});
