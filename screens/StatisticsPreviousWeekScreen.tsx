import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { newDateInClientTimezone } from "../app/dateUtils";
import PieChartRenderer from "../components/PieChartRenderer";
import { RootStackParamList } from "../NavContainer";

export default function StatisticsPreviousWeekScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList>) {
  const now = newDateInClientTimezone();
  return (
    <PieChartRenderer
      start={new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14)}
      end={new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)}
      navigation={navigation}
    />
  );
}
