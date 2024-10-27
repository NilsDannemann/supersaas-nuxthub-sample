<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold leading-7 font-display">
          API Keys
        </h2>
      </div>
      <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
        Manage your API keys for external services.
      </p>
    </template>
    <UForm
      class="space-y-6 max-w-lg"
      :schema="schema"
      :state="state"
      @submit="onSubmit"
    >
      <UFormGroup label="ActiveCampaign URL" size="lg" name="activeCampaignUrl">
        <UInput
          v-model="state.activeCampaignUrl"
          placeholder="Enter your ActiveCampaign URL"
        />
      </UFormGroup>
      <UFormGroup label="ActiveCampaign API Key" size="lg" name="activeCampaignKey">
        <UInput
          v-model="state.activeCampaignKey"
          type="password"
          placeholder="Enter your ActiveCampaign API Key"
        />
      </UFormGroup>
      <div>
        <UButton
          :loading="loading"
          :disabled="loading"
          type="submit"
          color="black"
          label="Save changes"
          size="lg"
        />
      </div>
    </UForm>
  </UCard>
</template>

<script setup>
import { z } from "zod";
import { toast } from "vue-sonner";
import { onMounted } from "vue";

const loading = ref(false);
const schema = z.object({
  activeCampaignUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  activeCampaignKey: z.string().min(1, "API Key is required"),
});

const state = ref({
  activeCampaignUrl: "",
  activeCampaignKey: "",
});

// Fetch existing API keys on component mount
onMounted(async () => {
  try {
    const { apiKeys } = await $fetch("/api/account/api-keys");
    state.value.activeCampaignUrl = apiKeys.activeCampaignAccountUrl || "";
    state.value.activeCampaignKey = apiKeys.activeCampaignAccountKey || "";
  } catch (error) {
    console.error("Failed to fetch API keys:", error);
    toast.error("Failed to load existing API keys");
  }
});

async function onSubmit(event) {
  try {
    loading.value = true;
    await $fetch("/api/account/update-api-keys", {
      method: "POST",
      body: {
        activeCampaignAccountUrl: event.data.activeCampaignUrl,
        activeCampaignAccountKey: event.data.activeCampaignKey,
      },
    });
    toast.success("API keys updated successfully");
  } catch (error) {
    console.error(error);
    toast.error(
      error.data?.message || "An error occurred while updating the API keys.",
    );
  } finally {
    loading.value = false;
  }
}
</script>
