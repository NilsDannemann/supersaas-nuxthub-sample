<template>
  <UModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{
      container: 'flex min-h-screen items-center justify-center',
      modal: 'w-[75vw] h-[75vh] max-h-[75vh] sm:max-w-[75vw] sm:max-h-[75vh]',
      overlay: {
        base: 'fixed inset-0 bg-gray-950/50 dark:bg-gray-950/75'
      }
    }"
    :transition="{
      enter: 'duration-200 ease-out',
      enterFrom: 'opacity-0 scale-95',
      enterTo: 'opacity-100 scale-100',
      leave: 'duration-200 ease-in',
      leaveFrom: 'opacity-100 scale-100',
      leaveTo: 'opacity-0 scale-95'
    }"
  >
    <div class="flex flex-col h-full">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h2>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          @click="$emit('update:modelValue', false)"
        />
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto p-4">
        <slot />
      </div>

      <!-- Optional Footer -->
      <div v-if="$slots.footer" class="p-4 border-t border-gray-200 dark:border-gray-800">
        <slot name="footer" />
      </div>
    </div>
  </UModal>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

defineEmits(['update:modelValue']);
</script> 