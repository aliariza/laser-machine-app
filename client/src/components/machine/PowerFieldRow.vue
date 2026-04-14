<template>
  <FormField label="Güç" wide>
    <div class="inline-row">
      <BaseSelect
        :model-value="powerId"
        required
        @update:modelValue="$emit('update:powerId', $event)"
      >
        <option value="">Güç seçiniz</option>
        <option v-for="power in powers" :key="power._id" :value="power._id">
          {{ power.name }}
        </option>
      </BaseSelect>

      <BaseInput
        :model-value="newPowerName"
        placeholder="Yeni güç ekle"
        @update:modelValue="$emit('update:newPowerName', $event)"
      />

      <IconButton
        variant="secondary"
        size="md"
        class="form-icon-btn"
        @click="$emit('add-power')"
        title="Güç Ekle"
      >
        <Plus :size="16" />
      </IconButton>

      <IconButton
        variant="danger"
        size="md"
        class="form-icon-btn"
        @click="$emit('delete-selected-power')"
        title="Seçileni Sil"
      >
        <Trash2 :size="16" />
      </IconButton>
    </div>
  </FormField>
</template>

<script setup>
import { Plus, Trash2 } from "lucide-vue-next";
import BaseInput from "../ui/BaseInput.vue";
import BaseSelect from "../ui/BaseSelect.vue";
import FormField from "../ui/FormField.vue";
import IconButton from "../ui/IconButton.vue";

defineProps({
  powers: {
    type: Array,
    required: true,
  },
  powerId: {
    type: String,
    default: "",
  },
  newPowerName: {
    type: String,
    default: "",
  },
});

defineEmits([
  "update:powerId",
  "update:newPowerName",
  "add-power",
  "delete-selected-power",
]);
</script>

<style scoped>
.inline-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.form-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1100px) {
  .inline-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
