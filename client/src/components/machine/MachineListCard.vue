<template>
  <div class="list-card">
    <div class="card-header">
      <div>
        <h2 class="section-title">Makine Listesi</h2>
        <p class="section-subtitle">
          Kayıtları filtreleyin, düzenleyin ve teknik çıktıları alın.
        </p>
      </div>
      <div class="list-card-chip">
        <span>Aktif görünüm</span>
        <strong>{{ filteredCount }}</strong>
      </div>
    </div>

    <MachineFilters
      :powers="powers"
      :model-search="modelSearch"
      :power-filter="powerFilter"
      :machine-type-filter="machineTypeFilter"
      :total-count="totalCount"
      :filtered-count="filteredCount"
      @update:modelSearch="$emit('update:modelSearch', $event)"
      @update:powerFilter="$emit('update:powerFilter', $event)"
      @update:machineTypeFilter="$emit('update:machineTypeFilter', $event)"
      @clear="$emit('clear')"
    />

    <MachineTable
      :machines="machines"
      :selected-machine-ids="selectedMachineIds"
      :expanded-machine-ids="expandedMachineIds"
      :is-exporting="isExporting"
      :is-deleting="isDeleting"
      @update:selectedMachineIds="$emit('update:selectedMachineIds', $event)"
      @toggle-expanded="$emit('toggle-expanded', $event)"
      @edit="$emit('edit', $event)"
      @copy="$emit('copy', $event)"
      @export-single="$emit('export-single', $event)"
      @delete="$emit('delete', $event)"
    />

    <MachinePagination
      :filtered-count="filteredCount"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-size-options="pageSizeOptions"
      :total-pages="totalPages"
      :page-start="pageStart"
      :page-end="pageEnd"
      :visible-page-numbers="visiblePageNumbers"
      @update:pageSize="$emit('update:pageSize', $event)"
      @go-to-page="$emit('go-to-page', $event)"
      @previous-page="$emit('previous-page')"
      @next-page="$emit('next-page')"
    />
  </div>
</template>

<script setup>
import MachineFilters from "./MachineFilters.vue";
import MachinePagination from "./MachinePagination.vue";
import MachineTable from "./MachineTable.vue";

defineProps({
  powers: {
    type: Array,
    default: () => [],
  },
  modelSearch: {
    type: String,
    default: "",
  },
  powerFilter: {
    type: String,
    default: "",
  },
  machineTypeFilter: {
    type: String,
    default: "",
  },
  totalCount: {
    type: Number,
    default: 0,
  },
  filteredCount: {
    type: Number,
    default: 0,
  },
  machines: {
    type: Array,
    default: () => [],
  },
  selectedMachineIds: {
    type: Array,
    default: () => [],
  },
  expandedMachineIds: {
    type: Array,
    default: () => [],
  },
  isExporting: {
    type: Boolean,
    default: false,
  },
  isDeleting: {
    type: Boolean,
    default: false,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  pageSizeOptions: {
    type: Array,
    default: () => [],
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  pageStart: {
    type: Number,
    default: 0,
  },
  pageEnd: {
    type: Number,
    default: 0,
  },
  visiblePageNumbers: {
    type: Array,
    default: () => [],
  },
});

defineEmits([
  "update:modelSearch",
  "update:powerFilter",
  "update:machineTypeFilter",
  "clear",
  "update:selectedMachineIds",
  "toggle-expanded",
  "edit",
  "copy",
  "export-single",
  "delete",
  "update:pageSize",
  "go-to-page",
  "previous-page",
  "next-page",
]);
</script>

<style scoped>
.list-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(16px);
  padding: 26px;
}

.card-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section-title {
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.section-subtitle {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.list-card-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: var(--bg-accent-soft);
  border: 1px solid var(--border-accent);
  color: var(--text-secondary);
  white-space: nowrap;
}

.list-card-chip span {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.list-card-chip strong {
  font-size: 16px;
  color: var(--text-primary);
}

@media (max-width: 700px) {
  .list-card {
    padding: 20px 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .list-card-chip {
    align-self: flex-start;
  }
}
</style>
