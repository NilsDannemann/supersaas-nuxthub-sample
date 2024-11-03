<template>
  <AppPageContainer pretitle="overview" :title="`${greeting}, ${user.name}`">
    <template #description>
      <span class="text-sm text-gray-500">Dashboard Overview</span>
    </template>
    <div class="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <p class="text-gray-600 dark:text-gray-400">More dashboard content and analytics coming soon.</p>
    </div>
  </AppPageContainer>
</template>

<script setup>
const { user } = useUserSession();

const greeting = computed(() => {
  const time = new Date();
  const hours = time.getHours();
  if (hours < 12) {
    return "Good morning";
  } else if (hours < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
});
</script>
