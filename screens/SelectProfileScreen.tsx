import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { BackHandler, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, Title } from "react-native-paper";
import SelectProfileButton from "../components/SelectProfileButton";
import { selectAuthUserId } from "../features/authentication/authenticationSelectors";
import { logout } from "../features/authentication/authenticationSlice";
import { selectActiveProfile } from "../features/profile/profileSelector";
import { Profile } from "../features/profile/profileTypes";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import useModalStyles from "../hooks/useModalStyles";
import { useResetAndDeHydrateProfile } from "../hooks/useResetAndDehydrateProfile";
import { useSetAndHydrateProfile } from "../hooks/useSetAndHydrateProfile";
import { RootStackParamList } from "../NavContainer";

export default function SelectProfileScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "SelectProfile">) {
  const authUserId = useAppSelector(selectAuthUserId);
  const profile = useAppSelector(selectActiveProfile);
  const [profiles, setProfiles] = useState<Profile[]>();
  const setAndHydrateProfile = useSetAndHydrateProfile();
  const resetAndDeHydrateProfile = useResetAndDeHydrateProfile();
  const [showProfilePending, setShowProfilePending] = useState(false);
  const modalStyles = useModalStyles();

  useEffect(() => {
    (async function getProfiles() {
      const response = await fetch(
        "https://household-backend.azurewebsites.net/api/V01/profile/GetByUserID/" + authUserId,
      );
      if (response.ok) {
        setProfiles(await response.json());
      }
    })();
  }, [authUserId, profile]);

  function handleSelectUser(profile: Profile) {
    if (profile.pendingRequest) {
      setShowProfilePending(true);
    } else {
      setAndHydrateProfile(profile).then(() => navigation.navigate("Home", { screen: "Chores" }));
    }
  }

  BackHandler.addEventListener("hardwareBackPress", () => {
    return true;
  });

  const dispatch = useAppDispatch();

  const onLogoutPressed = () => {
    resetAndDeHydrateProfile();
    dispatch(logout());
    navigation.navigate("SignIn");
  };

  return (
    <View>
      <View style={styles.contentContainer}>
        <View style={styles.profileCircles}>
          {profiles?.map((p) => (
            <View key={p.id} style={{ alignItems: "center" }}>
              <Text>{p.alias}</Text>
              <SelectProfileButton profile={p} handleSelectUser={handleSelectUser} />
            </View>
          ))}
          <View style={{ alignItems: "center" }}>
            <Text>Create new Profile</Text>
            <View style={[styles.profilePortrait, { backgroundColor: "#474747" }]}>
              <TouchableOpacity onPress={() => navigation.navigate("JoinOrCreateHouseholdPrompt")}>
                <Text style={styles.avatar}>???</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Button style={styles.logoutButton} mode={"elevated"} onPress={onLogoutPressed}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Button>
      </View>
      <Modal
        animationType='slide'
        transparent={true}
        visible={showProfilePending}
        onRequestClose={() => {
          setShowProfilePending(false);
        }}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Title style={modalStyles.modalText}>This profile is still pending</Title>
            <Button mode='contained' onPress={() => setShowProfilePending(false)}>
              <Text>Ok!</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  profileCircles: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "80%",
  },
  profilePortrait: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: "center",
    marginBottom: 15,
  },
  profilePortraitPressable: {
    height: "100%",
    width: "100%",
  },
  avatar: {
    fontSize: 50,
    textAlign: "center",
  },
  logoutButton: {
    width: "50%",
    height: 50,
    justifyContent: "center",
    textAlign: "center",
    margin: 10,
  },
  logoutText: {
    fontWeight: "bold",
    textAlignVertical: "center",
    textAlign: "center",
    fontSize: 18,
  },
});
