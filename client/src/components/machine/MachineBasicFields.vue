<template>
  <FormField label="Tabla Tipi">
    <BaseSelect
      :model-value="form.tableType"
      required
      @update:modelValue="$emit('update:tableType', $event)"
    >
      <option value="">Tabla tipi seçiniz</option>
      <option value="Tek Tabla">Tek Tabla</option>
      <option value="Çift Tabla">Çift Tabla</option>
    </BaseSelect>
  </FormField>

  <FormField label="Makine Tipi">
    <BaseSelect
      :model-value="form.machineType"
      required
      @update:modelValue="$emit('update:machineType', $event)"
    >
      <option value="">Makine tipi seçiniz</option>
      <option value="Açık Kasa">Açık Kasa</option>
      <option value="Kapalı Kasa">Kapalı Kasa</option>
    </BaseSelect>
  </FormField>

  <FormField label="Model">
    <BaseInput
      :model-value="form.model"
      placeholder="Model giriniz"
      required
      @update:modelValue="$emit('update:model', $event)"
    />
  </FormField>

  <FormField
    label="Resim Yolu"
    hint="Opsiyonel. Yalnızca görsel dosya yolunuz varsa doldurun."
  >
    <BaseInput
      :model-value="form.imagePath"
      placeholder="uploads/fs3015.png"
      @update:modelValue="$emit('update:imagePath', $event)"
    />
  </FormField>
</template>

<script setup>
import BaseInput from "../ui/BaseInput.vue";
import BaseSelect from "../ui/BaseSelect.vue";
import FormField from "../ui/FormField.vue";

defineProps({
  form: {
    type: Object,
    required: true,
  },
});

defineEmits([
  "update:tableType",
  "update:machineType",
  "update:model",
  "update:imagePath",
]);
</script>
