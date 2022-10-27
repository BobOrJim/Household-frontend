import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { Switch } from "react-native-paper";
//import { white } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

import CustomInput from "../components/CustomInput";
import {
  selectHousehold,
  selectProfileByHousholdId,
} from "../features/household/householdSelectors";
import { editHouseholdThunk } from "../features/household/householdSlice";
import { editProfile } from "../features/profile/profileSlice";
import { selectPauses } from "../features/pause/pauseSelectors";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { RootStackParamList } from "../NavContainer";
import ProfileListItem from "../components/ProfileListItem";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function EditHouseholdScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList>) {
  //add route.params for householdId instead of "stringPlaceholder";
  const householdId = "stringPlaceholder";
  const dispatch = useAppDispatch();
  const household = useAppSelector(selectHousehold);
  const members = useAppSelector(selectProfileByHousholdId);
  const membersOnPause = useAppSelector(selectPauses);
  console.log(members);
  //console.log(membersOnPause);
  const [enabled, setEnabled] = useState(false);
  const [modalAddAdminVisible, setModalAddAdminVisible] = useState(false);
  const [modalRemoveAdminVisible, setModalRemoveAdminVisible] = useState(false);

  const {
    control,
    handleSubmit,
    //formState: {},
  } = useForm();

  const onEditHouseholdPressed = (data: FieldValues) => {
    const name = data.housholdName;
    dispatch(
      editHouseholdThunk({
        householdEditDto: { name: name },
        householdId: householdId,
      }),
    );
  };

  var householdPicture = "../assets/house-cartoon.png";

  const toggleSwitch = () => {
    setEnabled((oldValue) => !oldValue);
  };

  const thumbColorOn = Platform.OS === "android" ? "#0cd1e8" : "#f3f3f3";
  const thumbColorOff = Platform.OS === "android" ? "#f04141" : "#f3f3f3";
  const trackColorOn = Platform.OS === "android" ? "#98e7f0" : "#0cd1e8";
  const trackColorOff = Platform.OS === "android" ? "#f3adad" : "#f04141";

  return (
    <ScrollView>
      <View style={styles.container}>
        <View>
          <Image source={require(householdPicture)} style={styles.householdPicture} />
          <Text>Household's name: </Text>
          <Text style={styles.showProperty}>{household.name}</Text>

          <Text>Household's admin: </Text>
          <View style={{ flex: 1, flexDirection: "row" }}>
            {members.map((member) => {
              if (member.isAdmin) {
                return <ProfileListItem profile={member} />;
              }
            })}
          </View>

          <Modal
            animationType='slide'
            transparent={true}
            visible={modalAddAdminVisible}
            onRequestClose={() => {
              setModalAddAdminVisible(!modalAddAdminVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Click profile to add as admin</Text>
                <View style={{ flexDirection: "row" }}>
                  {members.map((member) => {
                    if (member.isAdmin == false) {
                      return (
                        <Pressable
                          onPress={() =>
                            dispatch(
                              editProfile({
                                profileEditDto: { isAdmin: true },
                                profileId: member.id,
                              }),
                            )
                          }
                        >
                          <ProfileListItem profile={member} />
                        </Pressable>
                      );
                    }
                  })}
                </View>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalAddAdminVisible(!modalAddAdminVisible)}
                >
                  <Text style={styles.textStyle}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <Modal
            animationType='slide'
            transparent={true}
            visible={modalRemoveAdminVisible}
            onRequestClose={() => {
              setModalRemoveAdminVisible(!modalRemoveAdminVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Click admin profile to remove</Text>
                <View style={{ flexDirection: "row" }}>
                  {members.map((member) => {
                    if (member.isAdmin) {
                      return (
                        <Pressable
                          onPress={() =>
                            dispatch(
                              editProfile({
                                profileEditDto: {
                                  isAdmin: false,
                                  avatar: member.avatar,
                                  alias: member.alias,
                                },
                                profileId: member.id,
                              }),
                            )
                          }
                        >
                          <ProfileListItem profile={member} />
                        </Pressable>
                      );
                    }
                  })}
                </View>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => setModalRemoveAdminVisible(!modalRemoveAdminVisible)}
                >
                  <Text style={styles.textStyle}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <View style={{ flexDirection: "row" }}>
            <Pressable
              style={[styles.button, styles.buttonOpen]}
              onPress={() => setModalAddAdminVisible(true)}
            >
              <Text style={styles.textStyle}>add admin</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonOpen]}
              onPress={() => setModalRemoveAdminVisible(true)}
            >
              <Text style={styles.textStyle}>remove admin</Text>
            </Pressable>
          </View>

          <Text>Change household's name: </Text>
          <CustomInput
            name='householdName'
            placeholder='Enter a new household name'
            control={control}
          ></CustomInput>
          <TouchableOpacity style={styles.pressable} onPress={handleSubmit(onEditHouseholdPressed)}>
            <Text>Submit</Text>
          </TouchableOpacity>

          <Text>Household code: </Text>
          <Text style={styles.showProperty}>{household.code}</Text>
          <Text>Household members: </Text>
          <View style={{ flex: 1, flexDirection: "row" }}>
            {members.map((member) => {
              if (member.isAdmin) {
                return (
                  <View>
                    <ProfileListItem profile={member} />
                    <Switch
                      value={enabled}
                      onValueChange={toggleSwitch}
                      thumbColor={enabled ? thumbColorOn : thumbColorOff}
                      trackColor={{ false: trackColorOff, true: trackColorOn }}
                    />
                    {enabled ? (member.isAdmin = true) : (member.isAdmin = false)}
                  </View>
                );
              }
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  pressable: {
    fontSize: 70,
    fontWeight: "bold",
    width: 200,
    height: 50,
    color: "blue",
    backgroundColor: "white",
    borderRadius: 5,
    margin: 2,
    borderColor: "red",
  },
  showProperty: {
    alignItems: "center",
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: "black",
  },
  householdPicture: {
    width: 1445 * 0.08,
    height: 1250 * 0.08,
    borderRadius: 5,
  },
  householdMemberPicture: {
    width: 50,
    height: 50,
    margin: 0,
    borderRadius: 20,
  },
  avatar: {
    fontSize: 50,
    textAlign: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
