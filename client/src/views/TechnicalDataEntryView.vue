<template>
  <div class="page">
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Makine Teknik Veri Yönetimi</h1>
          <p class="page-subtitle">
            Makine kayıtları, teknik özellikler ve Excel çıktıları
          </p>
        </div>
      </div>
      <MachineFormCard
        :powers="powers"
        :form="form"
        :new-power-name="newPowerName"
        :editing-machine-id="editingMachineId"
        :is-saving="isSaving"
        :is-exporting="isExporting"
        :is-importing="isImporting"
        @update:form="Object.assign(form, $event)"
        @update:newPowerName="newPowerName = $event"
        @add-power="addPower"
        @delete-selected-power="deleteSelectedPower"
        @save="saveMachine"
        @reset="resetForm"
        @export-all="exportExcel"
        @export-selected="exportSelectedExcel"
        @import="importExcel"
      />
      <div class="list-card">
        <div class="card-header">
          <h2 class="section-title">Makine Listesi</h2>
        </div>
        <MachineFilters
        :powers="powers"
        :model-search="modelSearch"
        :power-filter="powerFilter"
        :machine-type-filter="machineTypeFilter"
        :total-count="totalMachineCount"
        :filtered-count="filteredMachineCount"
        @update:modelSearch="modelSearch = $event"
        @update:powerFilter="powerFilter = $event"
        @update:machineTypeFilter="machineTypeFilter = $event"
        @clear="clearFilters"
        />
        <MachineTable
        :machines="paginatedMachines"
        :selected-machine-ids="selectedMachineIds"
        :expanded-machine-ids="expandedMachineIds"
        :is-exporting="isExporting"
        :is-deleting="isDeleting"
        @update:selectedMachineIds="selectedMachineIds = $event"
        @toggle-expanded="toggleExpanded"
        @edit="editMachine"
        @copy="copyMachine"
        @export-single="exportSingleMachine"
        @delete="deleteMachine"
        />
        <MachinePagination
        :filtered-count="filteredMachineCount"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-size-options="pageSizeOptions"
        :total-pages="totalPages"
        :page-start="pageStart"
        :page-end="pageEnd"
        :visible-page-numbers="visiblePageNumbers"
        @update:pageSize="setPageSize"
        @go-to-page="goToPage"
        @previous-page="goToPreviousPage"
        @next-page="goToNextPage"
        />
      </div>
    </div>

    <ToastMessage
      :visible="toastVisible"
      :message="toastMessage"
      :type="toastType"
    />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import MachineFilters from "../components/machine/MachineFilters.vue";
import MachinePagination from "../components/machine/MachinePagination.vue";
import MachineTable from "../components/machine/MachineTable.vue";
import MachineFormCard from "../components/machine/MachineFormCard.vue";
import ToastMessage from "../components/ui/ToastMessage.vue";
import { useMachinePage } from "../composables/useMachinePage";
import { useToast } from "../composables/useToast";

const {
  toastVisible,
  toastMessage,
  toastType,
  showToast,
} = useToast();

const {
  powers,
  newPowerName,
  selectedMachineIds,
  editingMachineId,
  expandedMachineIds,
  modelSearch,
  powerFilter,
  machineTypeFilter,
  form,
  paginatedMachines,
  totalMachineCount,
  filteredMachineCount,
  currentPage,
  pageSize,
  pageSizeOptions,
  totalPages,
  pageStart,
  pageEnd,
  visiblePageNumbers,
  resetForm,
  editMachine,
  copyMachine,
  toggleExpanded,
  setPageSize,
  goToPage,
  goToNextPage,
  goToPreviousPage,
  fetchPowers,
  fetchMachines,
  addPower,
  deleteSelectedPower,
  saveMachine,
  deleteMachine,
  exportSingleMachine,
  exportExcel,
  exportSelectedExcel,
  importExcel,
  clearFilters,
  isSaving,
  isExporting,
  isImporting,
  isDeleting,
} = useMachinePage(showToast);
onMounted(async () => {
  await fetchPowers();
  await fetchMachines();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3f6fb;
  padding: 32px 24px 48px;
}

.container {
  max-width: 1450px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
  color: #172033;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.list-card {
  background: #ffffff;
  border: 1px solid #e6ebf2;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  padding: 24px;
  margin-top: 24px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

@media (max-width: 700px) {
  .page {
    padding: 20px 14px 32px;
  }

  .list-card {
    padding: 18px;
    border-radius: 16px;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>
