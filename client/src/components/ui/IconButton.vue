<template>
  <BaseButton
    :type="type"
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :block="block"
    icon-only
  >
    <slot />
  </BaseButton>
</template>

<script setup>
import BaseButton from "./BaseButton.vue";

defineProps({
  type: {
    type: String,
    default: "button",
  },
  variant: {
    type: String,
    default: "secondary",
  },
  size: {
    type: String,
    default: "sm",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
});
</script>
