import NotificationIcon from "@/assets/svg/notification.svg";
import ProjectItem from "@/components/ProjectItem";
import RoundedButton from "@/components/RoundedButton";
import TaskGroupItem from "@/components/TaskGroupItem";
import TaskItem from "@/components/TaskItem";
import { CircularProgressIndicator, Host } from '@expo/ui/jetpack-compose';
import { graphicsLayer, size } from '@expo/ui/jetpack-compose/modifiers';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { Image, Text, View } from "react-native";

const PROGRESS_SIZE = 76;
const PROGRESS = 0.85;

export default function Home() {
  return (
    <View className="flex flex-1 gap-xl">
      <View className="flex flex-row gap-lg items-center justify-center">
        <Image source={require("@/assets/images/avatar.png")} className="w-[48px] h-[48px] rounded-full" />
        <View className="flex-1">
          <Text className="font-lexend">Hello!</Text>
          <Text className="text-lg font-lexend-semibold ">Livia Vaccaro</Text>
        </View>
        <View>
          <NotificationIcon />
          <View className="w-[8px] h-[8px] rounded-full bg-primary absolute top-0 right-[3px]" />
        </View>
      </View>
      <View className="bg-primary rounded-xl p-xl flex flex-row gap-2xl items-center">
        <View className="flex flex-col gap-xl w-1/2">
          <Text className="font-lexend text-white">Your today’s task{"\n"}almost done!</Text>
          <RoundedButton text="View Task" primary={false} className="px-[20px] py-[10px]" size="sm" />
        </View>
        <View
          style={{ width: PROGRESS_SIZE, height: PROGRESS_SIZE }}
        >
          <Host matchContents>
            <CircularProgressIndicator
              progress={PROGRESS}
              color="#EEE9FF"
              trackColor="#8764FF"
              gapSize={0}
              strokeWidth={8}
              modifiers={[size(PROGRESS_SIZE, PROGRESS_SIZE), graphicsLayer({ scaleX: -1 })]}
            />
          </Host>
          <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
            <Text className="font-lexend-semibold text-white text-sm">
              {Math.round(PROGRESS * 100)}%
            </Text>
          </View>
        </View>
        <View className="bg-[#FFFFFF40] rounded-lg absolute top-lg right-lg w-[20px] h-[20px]">
          <MaterialIcons name="more-horiz" size={20} color="#FFFFFF" />
        </View>
      </View>
      <View className="flex flex-col gap-lg">
        <View>
          <Text>In Progress</Text>
          <Text>6</Text>
        </View>
        <ProjectItem name="Grocery shopping app design" type="office_project" />
        <TaskGroupItem type="office_project" task_count={6} completed={0.5} />
        <TaskItem status="in_progress" project_name="Project 1" task_name="Task 1" />
      </View>
    </View>
  );
} 
