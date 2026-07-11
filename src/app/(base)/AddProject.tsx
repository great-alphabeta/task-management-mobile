import BookIcon from "@/assets/svg/book.svg";
import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import CalendarIcon from "@/assets/svg/calendar.svg";
import DownIcon from "@/assets/svg/down.svg";
import UserIcon from "@/assets/svg/user.svg";
import Header from "@/components/Header";
import RoundedButton from "@/components/RoundedButton";
import { createProject } from "@/db/projects";
import type { TaskGroupId } from "@/types/database";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, Text, TextInput, View } from "react-native";
import SelectDropdown from 'react-native-select-dropdown';

type TaskGroupOption = {
  id: TaskGroupId;
  title: string;
  icon: typeof BriefcaseIcon;
  iconColor: string;
  bgColor: string;
};

export default function AddProject() {
  const [image, setImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const taskGroups: TaskGroupOption[] = [
    {
      id: 'office_project',
      title: 'Office Project',
      icon: BriefcaseIcon,
      iconColor: "#F478B8",
      bgColor: "#FFE4F2",
    },
    {
      id: 'personal_project',
      title: 'Personal Project',
      icon: UserIcon,
      iconColor: "#9260F4",
      bgColor: "#E8E1FF",
    },
    {
      id: 'daily_study',
      title: 'Daily Study',
      icon: BookIcon,
      iconColor: "#FF9142",
      bgColor: "#FFE6D4",
    },
  ]
  const [selectedTaskGroup, setSelectedTaskGroup] = useState(taskGroups[0]);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [startDatePickerShow, setStartDatePickerShow] = useState(false);
  const [endDate, setEndDate] = useState(new Date());
  const [endDatePickerShow, setEndDatePickerShow] = useState(false);

  const handleProjectNameChange = (text: string) => {
    setProjectName(text);
  }
  const handleDescriptionChange = (text: string) => {
    setDescription(text);
  }
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddProject = async () => {
    const trimmedName = projectName.trim();

    if (!trimmedName) {
      Alert.alert("Missing project name", "Please enter a project name.");
      return;
    }

    if (endDate < startDate) {
      Alert.alert("Invalid dates", "End date must be on or after the start date.");
      return;
    }

    setIsSaving(true);

    try {
      await createProject({
        group_id: selectedTaskGroup.id,
        project_name: trimmedName,
        project_description: description.trim(),
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        logo_uri: image ?? "",
      });

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Save failed", "Could not save the project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex flex-1 gap-xl">
      <Header title="Add Project" />
      <View className="w-full">
        <SelectDropdown
          data={taskGroups}
          onSelect={(selectedItem: TaskGroupOption) => {
            setSelectedTaskGroup(selectedItem);
          }}
          renderButton={() => {
            return (
              <View className="flex flex-row gap-sm items-center p-xl bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
                <View className={`rounded-lg w-[30px] h-[30px] items-center justify-center`} style={{ backgroundColor: selectedTaskGroup.bgColor }}>
                  <selectedTaskGroup.icon width={24} height={24} color={selectedTaskGroup.iconColor} />
                </View>
                <View className="flex flex-col flex-1">
                  <Text className="text-secondary font-lexend text-sm">Task Group</Text>
                  <Text className="text-black font-lexend-semibold">{selectedTaskGroup.title}</Text>
                </View>
                <View>
                  <DownIcon width={24} height={24} color="black" />
                </View>
              </View>
            );
          }}
          renderItem={(taskGroup: TaskGroupOption) => {
            return (
              <View className="flex flex-row gap-sm items-center p-xl bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
                <View className={`rounded-lg w-[30px] h-[30px] items-center justify-center`} style={{ backgroundColor: taskGroup.bgColor }}>
                  <taskGroup.icon width={24} height={24} color={taskGroup.iconColor} />
                </View>
                <Text className="text-black font-lexend-semibold w-full">{taskGroup.title}</Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View className="flex flex-col gap-sm w-full bg-[#FFFFFF] p-xl rounded-lg shadow-md shadow-black/10">
        <Text className="text-secondary font-lexend text-sm">Project Name</Text>
        <TextInput
          cursorColor="#7c3aed"
          value={projectName}
          onChangeText={handleProjectNameChange}
          className="font-lexend text-black"
        />
      </View>
      <View className="flex flex-col gap-sm w-full bg-[#FFFFFF] p-xl rounded-lg shadow-md shadow-black/10">
        <Text className="text-secondary font-lexend text-sm">Description</Text>
        <TextInput
          cursorColor="#7c3aed"
          value={description}
          onChangeText={handleDescriptionChange}
          className="font-lexend text-black text-sm"
          multiline={true}
          numberOfLines={4}
        />
      </View>
      <Pressable onPress={() => setStartDatePickerShow(true)}>
        <View className="flex flex-row gap-sm items-center p-lg bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
          <CalendarIcon width={24} height={24} color="#5F33E1" />
          <View className="flex flex-col flex-1">
            <Text className="text-secondary font-lexend text-sm">Start Date</Text>
            <Text className="text-black font-lexend">{String(startDate.getDate()).padStart(2, "0")} {startDate.toLocaleString('en-US', { month: 'short' })}, {startDate.getFullYear()}</Text>
          </View>
          <View>
            <DownIcon width={24} height={24} color="black" />
          </View>
        </View>
      </Pressable>
      <Pressable onPress={() => setEndDatePickerShow(true)}>
        <View className="flex flex-row gap-sm items-center p-lg bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
          <CalendarIcon width={24} height={24} color="#5F33E1" />
          <View className="flex flex-col flex-1">
            <Text className="text-secondary font-lexend text-sm">End Date</Text>
            <Text className="text-black font-lexend">{String(endDate.getDate()).padStart(2, "0")} {endDate.toLocaleString('en-US', { month: 'short' })}, {endDate.getFullYear()}</Text>
          </View>
          <View>
            <DownIcon width={24} height={24} color="black" />
          </View>
        </View>
      </Pressable>
      <View className="flex flex-row gap-sm items-center justify-between p-lg bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
        <View className="flex flex-row gap-sm items-center">
          {image && <Image source={{ uri: image }} className="w-[44px] h-[44px] rounded-full" />}
        </View>
        <Pressable onPress={() => pickImage()} className="bg-[#EDE8FF] rounded-lg p-sm">
          <Text className="text-primary font-lexend">Change Logo</Text>
        </Pressable>
      </View>
      <RoundedButton
        text={isSaving ? "Saving..." : "Add Project"}
        onPress={handleAddProject}
        disabled={isSaving}
      />
      {startDatePickerShow && (
        <DateTimePicker
          testID="dateTimePicker"
          value={startDate}
          mode='date'
          onValueChange={(_event, selectedDate) => {
            if (selectedDate) {
              setStartDate(selectedDate);
            }
            setStartDatePickerShow(false);
          }}
          onDismiss={() => setStartDatePickerShow(false)}
        />
      )}
      {endDatePickerShow && (
        <DateTimePicker
          testID="dateTimePicker"
          value={endDate}
          mode='date'
          onValueChange={(_event, selectedDate) => {
            if (selectedDate) {
              setEndDate(selectedDate);
            }
            setEndDatePickerShow(false);
          }}
          onDismiss={() => setEndDatePickerShow(false)}
        />
      )}
    </View>
  );
} 
