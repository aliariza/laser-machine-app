<template>
  <input
    ref="inputRef"
    :value="modelValue"
    class="base-input"
    :type="type"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
import { ref } from "vue";

defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);

const inputRef = ref(null);

function focus() {
  inputRef.value?.focus();
}

defineExpose({
  focus,
});
</script>

<style scoped>
.base-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--border-soft);
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  font-size: 14px;
  transition: all 0.18s ease;
  box-sizing: border-box;
}

.base-input::placeholder {
  color: var(--text-muted);
}

.base-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-focus);
}
</style>
