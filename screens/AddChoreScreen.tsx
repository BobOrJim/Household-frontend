import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import React, { useCallback, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Button } from "react-native-paper";
import CustomInput from "../components/CustomInput";
import { RootStackParamList } from "../NavContainer";

export default function AddChoreScreen({ navigation }: NativeStackScreenProps<RootStackParamList>) {
  const {
    control,
    handleSubmit,
    formState: {},
  } = useForm();

  const [openPoint, setOpenPoint] = useState(false);
  const [openFrequency, setOpenFrequency] = useState(false);
  const [frequencyValue, setFrequencyValue] = useState(1);
  const [pointValue, setPointValue] = useState(2);
  const onOpenFrequency = useCallback(() => {
    setOpenPoint(false);
  }, []);

  const onOpenPoint = useCallback(() => {
    setOpenFrequency(false);
  }, []);
  const [frequencyItems, setFrequencyItems] = useState([
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
    { label: "6", value: 6 },
    { label: "7", value: 7 },
  ]);
  const [pointItems, setPointItems] = useState([
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "4", value: 4 },
    { label: "6", value: 6 },
    { label: "8", value: 8 },
  ]);

  const [recording, setRecording] = useState<Audio.Recording | any>();
  const [recordings, setRecordings] = useState([]);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );

        setRecording(recording);
      } else {
        setMessage("Please grant permission to app to access microphone");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    setRecording(undefined!);
    await recording!.stopAndUnloadAsync();

    let updatedRecordings: any = [...recordings];
    const { sound, status } = await recording!.createNewLoadedSoundAsync();
    updatedRecordings.push({
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: recording!.getURI(),
    });
    setRecordings(updatedRecordings);
  }

  function getDurationFormatted(millis: number) {
    const minutes = millis / 1000 / 60;
    const minutesDisplay = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesDisplay) * 60);
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutesDisplay}:${secondsDisplay}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine: any, index) => {
      return (
        <View key={index}>
          <Text>
            Recording {index + 1} - {recordingLine.duration}
          </Text>
          <Button onPress={() => recordingLine.sound.replayAsync()}>
            <Text>▶️ Play</Text>
          </Button>
          <Button onPress={() => Sharing.shareAsync(recordingLine.file)}>
            <Text>⏸️ Stop</Text>
          </Button>
        </View>
      );
    });
  }
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const onAddChorePressed = (data: FieldValues) => {
    console.log(data.title + data.description + frequencyValue + pointValue);
    navigation.navigate("Chores");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Chore</Text>
      <View>
        <CustomInput
          style={styles.input}
          placeholder='Title'
          name='title'
          control={control}
          rules={{
            required: "Title of chore is required",
            minLength: { value: 2, message: "Must be 2 or more letters." },
            maxLength: {
              value: 100,
              message: "Title can be maximum 100 letters.",
            },
          }}
        />
        <CustomInput
          style={styles.input}
          placeholder='Description'
          name='description'
          control={control}
          rules={{
            required: "Description of chore is required",
            minLength: { value: 2, message: "Must be 2 or more letters" },
            maxLength: {
              value: 1000,
              message: "Cannot be longer than 1000 letters",
            },
          }}
          multiline={true}
          numOfLines={5}
        />
      </View>
      <View style={{ display: "flex", flexDirection: "row", marginVertical: 30 }}>
        <View
          style={{
            width: "45%",
            paddingHorizontal: 10,
          }}
        >
          <Text>Frequency of chore</Text>
          <DropDownPicker
            style={styles.dropDownPicker}
            listMode='SCROLLVIEW'
            open={openFrequency}
            onOpen={onOpenFrequency}
            itemKey='value'
            value={frequencyValue}
            items={frequencyItems}
            setOpen={setOpenFrequency}
            setValue={setFrequencyValue}
            setItems={setFrequencyItems}
            closeOnBackPressed={true}
            closeAfterSelecting={true}
            theme='DARK'
            /* TODO:Use the above theme prop to alter theme based on devices' settings */
          />
        </View>
        <View
          style={{
            width: "45%",
            paddingHorizontal: 10,
          }}
        >
          <Text>Difficulty of chore</Text>
          <DropDownPicker
            style={styles.dropDownPicker}
            modalTitle='Select how difficult this task is'
            listMode='SCROLLVIEW'
            open={openPoint}
            onOpen={onOpenPoint}
            value={pointValue}
            itemKey='value'
            items={pointItems}
            setOpen={setOpenPoint}
            setValue={setPointValue}
            setItems={setPointItems}
            closeOnBackPressed={true}
            closeAfterSelecting={true}
            dropDownContainerStyle={{}}
            theme='LIGHT'
          />
        </View>
      </View>
      <View style={styles.section}>
        <Button style={styles.button} onPress={recording ? stopRecording : startRecording}>
          {recording ? <Text>⏹️ Stop Recording</Text> : <Text>🔴 Start Recording</Text>}
        </Button>
        {getRecordingLines()}
      </View>
      <View style={styles.section}>
        <Button style={styles.button} onPress={pickImage}>
          <Text>Pick Image</Text>
        </Button>
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      </View>
      <View style={{ display: "flex", flexDirection: "row" }}>
        <Button onPress={handleSubmit(onAddChorePressed)} style={styles.button}>
          <Text
            style={{
              color: "black",
              alignSelf: "center",
              justifyContent: "center",
            }}
          >
            Save
          </Text>
        </Button>
        <Button style={styles.button}>
          <Text
            style={{
              color: "black",
              alignSelf: "center",
              justifyContent: "center",
            }}
          >
            Close
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 50,
  },
  section: {
    backgroundColor: "#aaa",
    borderRadius: 20,
    marginVertical: 10,
    padding: 30,
  },
  button: {},
  input: {},
  dropDownPicker: {},
});
