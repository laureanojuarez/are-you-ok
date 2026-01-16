import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ name: "house.fill" }} drawable="ic_menu_home" />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="contact">
        <Icon sf={{ name: "phone.fill" }} drawable="ic_menu_call" />
        <Label>Contactos</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
