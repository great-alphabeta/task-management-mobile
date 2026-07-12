import BookIcon from "@/assets/svg/book.svg";
import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import CalendarIcon from "@/assets/svg/calendar.svg";
import DownIcon from "@/assets/svg/down.svg";
import UserIcon from "@/assets/svg/user.svg";
import AiDescriptionField from "@/components/AiDescriptionField";
import Header from "@/components/Header";
import RoundedButton from "@/components/RoundedButton";
import ScreenBackground from "@/components/ScreenBackground";
import { isAiConfigured } from "@/config/ai";
import { createProject } from "@/db/projects";
import { suggestTaskGroup } from "@/services/ai";
import type { TaskGroupId } from "@/types/database";
import { showAlert } from "@/utils/alert";
import { imagePickerAssetToDataUri } from "@/utils/image";
import FormDateTimePicker from "@/components/FormDateTimePicker";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
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
  const [isSuggestingGroup, setIsSuggestingGroup] = useState(false);

  const handleProjectNameChange = (text: string) => {
    setProjectName(text);
  }
  const handleDescriptionChange = (text: string) => {
    setDescription(text);
  }
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showAlert('Permission required', 'Permission to access the media library is required.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const dataUri = await imagePickerAssetToDataUri(result.assets[0]);
      setImage(dataUri);
    }
  };

  const handleSuggestGroup = async () => {
    const trimmedName = projectName.trim();

    if (!trimmedName) {
      showAlert("Project name required", "Enter a project name before suggesting a group.");
      return;
    }

    setIsSuggestingGroup(true);

    try {
      const suggestion = await suggestTaskGroup(trimmedName, description);
      const matchedGroup = taskGroups.find((group) => group.id === suggestion.group_id);

      if (!matchedGroup) {
        showAlert("Suggestion failed", "AI returned an unknown task group.");
        return;
      }

      setSelectedTaskGroup(matchedGroup);
      showAlert("Group suggested", suggestion.reason);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not suggest a task group.";
      showAlert("AI unavailable", message);
    } finally {
      setIsSuggestingGroup(false);
    }
  };

  const handleAddProject = async () => {
    const trimmedName = projectName.trim();

    if (!trimmedName) {
      showAlert("Missing project name", "Please enter a project name.");
      return;
    }

    if (endDate < startDate) {
      showAlert("Invalid dates", "End date must be on or after the start date.");
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
      showAlert("Save failed", "Could not save the project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenBackground>
      <View className="flex flex-1">
        <Header title="Add Project" />
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex flex-col gap-xl pb-xl"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
                  <View className="flex flex-row gap-sm items-center p-xl bg-[#FFFFFF] shadow-md shadow-black/10">
                    <View className={`rounded-lg w-[30px] h-[30px] items-center justify-center`} style={{ backgroundColor: taskGroup.bgColor }}>
                      <taskGroup.icon width={24} height={24} color={taskGroup.iconColor} />
                    </View>
                    <Text className="text-black font-lexend-semibold w-full">{taskGroup.title}</Text>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
            {isAiConfigured() ? (
              <Pressable
                onPress={handleSuggestGroup}
                disabled={isSuggestingGroup}
                className="bg-[#EDE8FF] rounded-lg px-md py-sm self-start mt-sm"
                style={{ opacity: isSuggestingGroup ? 0.6 : 1 }}
              >
                <Text className="text-primary font-lexend text-sm">
                  {isSuggestingGroup ? "Suggesting group..." : "Suggest group with AI"}
                </Text>
              </Pressable>
            ) : null}
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
          <AiDescriptionField
            label="Description"
            value={description}
            onChangeText={handleDescriptionChange}
            contextName={projectName}
            contextType="project"
          />
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
              {image && <Image source={{ uri: image }} className="w-[44px] h-[44px] rounded-full" resizeMode="cover" />}
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
        </ScrollView>
        <FormDateTimePicker
          visible={startDatePickerShow}
          testID="dateTimePicker"
          value={startDate}
          mode="date"
          onConfirm={setStartDate}
          onClose={() => setStartDatePickerShow(false)}
        />
        <FormDateTimePicker
          visible={endDatePickerShow}
          testID="dateTimePicker"
          value={endDate}
          mode="date"
          onConfirm={setEndDate}
          onClose={() => setEndDatePickerShow(false)}
        />
      </View>
    </ScreenBackground>
  );
}
