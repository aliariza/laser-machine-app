<template>
  <div class="list-toolbar">
    <div class="toolbar-field toolbar-search">
      <BaseInput
        :model-value="modelSearch"
        placeholder="Model veya anahtar kelime ara..."
        @update:modelValue="$emit('update:modelSearch', $event)"
      />
    </div>

    <div class="toolbar-field">
      <BaseSelect :model-value="powerFilter" @update:modelValue="$emit('update:powerFilter', $event)">
        <option value="">Tüm Güçler</option>
        <option v-for="power in powers" :key="power._id" :value="power._id">
          {{ power.name }}
        </option>
      </BaseSelect>
    </div>

    <div class="toolbar-field">
      <BaseSelect
        :model-value="machineTypeFilter"
        @update:modelValue="$emit('update:machineTypeFilter', $event)"
      >
        <option value="">Tüm Makine Tipleri</option>
        <option value="Açık Kasa">Açık Kasa</option>
        <option value="Kapalı Kasa">Kapalı Kasa</option>
      </BaseSelect>
    </div>

    <div class="toolbar-actions">
      <BaseButton type="button" variant="secondary" size="md" @click="$emit('clear')">
        Filtreleri Temizle
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from "../ui/BaseButton.vue";
import BaseInput from "../ui/BaseInput.vue";
import BaseSelect from "../ui/BaseSelect.vue";

defineProps({
  powers: {
    type: Array,
    required: true,
  },
  modelSearch: {
    type: String,
    required: true,
  },
  powerFilter: {
    type: String,
    required: true,
  },
  machineTypeFilter: {
    type: String,
    required: true,
  },
});

defineEmits([
  "update:modelSearch",
  "update:powerFilter",
  "update:machineTypeFilter",
  "clear",
]);
</script>

<style scoped>
.list-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1.5fr) 150px 170px auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-field {
  display: flex;
}

.toolbar-field :deep(.base-input),
.toolbar-field :deep(.base-select) {
  background: var(--bg-input-soft);
  font-size: 13px;
}

.toolbar-actions {
  display: flex;
  justify-content: flex-end;
}

.toolbar-actions :deep(.base-button) {
  height: 44px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 1100px) {
  .list-toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 700px) {
  .list-toolbar {
    gap: 10px;
    margin-bottom: 14px;
  }

  .toolbar-field :deep(.base-input),
  .toolbar-field :deep(.base-select) {
    height: 42px;
    font-size: 12.5px;
  }

  .toolbar-actions :deep(.base-button) {
    height: 42px;
    font-size: 12.5px;
    width: 100%;
  }
}
</style>
