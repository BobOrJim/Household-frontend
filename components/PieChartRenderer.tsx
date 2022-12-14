import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import PieChartCustom from "../components/PieChartCustom";
import { Text } from "react-native-paper";
import { useAppSelector } from "../hooks/reduxHooks";
import { StatisticsList } from "../features/choreCompleted/choreCompletedTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../NavContainer";
import { useRef } from "react";
import { selectStatsAllChoresNormalized, selectStatsForEachChoreNormalized } from "../features/pause/pauseSelectors";


interface Props {
  start: Date;
  end: Date;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function PieChartRenderer({ start, end, navigation }: Props) {
  const touchX = useRef(0);
  const statsForEachChoreNormalized = useAppSelector(state => selectStatsForEachChoreNormalized(state, start, new Date(end.getTime() + 60000)));
  const statsAllChoresNormalized = useAppSelector(state => selectStatsAllChoresNormalized(state, start, new Date(end.getTime() + 60000)));

  function renderItem(item: StatisticsList) {
    const name = item.name.split(" ");
    return (
      <View style={styles.pieContainerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("ChoreDetails", { choreId: item.id })}>
          <PieChartCustom data={item.data} subtitle={item.name} isSmall={true} />
          <Text style={styles.miniPieTitle}>{name.length > 1 ? name[0] + "..." : name[0]}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      onTouchStart={(e) => (touchX.current = e.nativeEvent.pageX)}
      onTouchEnd={(e) => {
        e.nativeEvent.pageX - touchX.current > 20 && navigation.goBack();
      }}
    >
      {statsAllChoresNormalized && (
        <View style={styles.bigPieContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("Home", { screen: "Chores" })}>
            <PieChartCustom data={statsAllChoresNormalized} subtitle='Total' isSmall={false} />
          </TouchableOpacity>
        </View>
      )}
      {statsForEachChoreNormalized && (
        <View style={styles.miniPieContainer}>
          <FlatList
            numColumns={3}
            data={statsForEachChoreNormalized
              .filter((stats) => stats.data.length)
              .sort((a, b) => b.data.length - a.data.length)
              .slice(0, 6)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderItem(item)}
            contentContainerStyle={{ height: 500 }}
            columnWrapperStyle={styles.columStyle}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pieContainerContainer: {
    justifyContent: "space-around",
  },
  bigPieContainer: {
    marginTop: 15,
  },
  miniPieContainer: {
    marginTop: 130,
    marginLeft: 10,
    marginRight: 10,
  },
  miniPieTitle: {
    position: "relative",
    textAlign: "center",
  },
  columStyle: {
    justifyContent: "space-evenly",
  },
});
