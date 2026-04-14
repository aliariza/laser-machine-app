<template>
  <div class="machine-filters">
    <MachineFilterToolbar
      :powers="powers"
      :model-search="modelSearch"
      :power-filter="powerFilter"
      :machine-type-filter="machineTypeFilter"
      @update:modelSearch="emit('update:modelSearch', $event)"
      @update:powerFilter="emit('update:powerFilter', $event)"
      @update:machineTypeFilter="emit('update:machineTypeFilter', $event)"
      @clear="emit('clear')"
    />

    <MachineFilterSummary
      :total-count="totalCount"
      :filtered-count="filteredCount"
    />
  </div>
</template>

<script setup>
import MachineFilterSummary from "./MachineFilterSummary.vue";
import MachineFilterToolbar from "./MachineFilterToolbar.vue";

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
  totalCount: {
    type: Number,
    required: true,
  },
  filteredCount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits([
  "update:modelSearch",
  "update:powerFilter",
  "update:machineTypeFilter",
  "clear",
]);
</script>
