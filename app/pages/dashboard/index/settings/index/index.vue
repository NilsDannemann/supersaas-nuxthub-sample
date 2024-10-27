<template>
  <div class="space-y-8">
    <AppSettingsUpdateProfile :user="user" />
    <AppSettingsUpdatePassword />
    <AppSettingsUpdateKeys />
    <AppSettingsManagePasskey />
    <AppSettingsManageLinkedAccounts />
  </div>
</template>

<script setup>
const { user } = useUserSession();
</script>
