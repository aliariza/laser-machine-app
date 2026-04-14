<template>
  <div class="form-field" :class="{ 'form-field--wide': wide }">
    <label v-if="label" class="form-field-label">{{ label }}</label>
    <slot />
    <small v-if="hint" class="form-field-hint">{{ hint }}</small>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: "",
  },
  hint: {
    type: String,
    default: "",
  },
  wide: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field--wide {
  grid-column: 1 / -1;
}

.form-field-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.form-field-hint {
  margin-top: -2px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.45;
}
</style>
