<template>
  <div class="page">
    <div class="container">
      <div class="page-header">
        <div class="page-header-copy">
          <div class="page-eyebrow">LAZER TEZGAHLARI KONTROL MASASI</div>
          <h1 class="page-title">Makine Teknik Veri Yönetimi</h1>
          <p class="page-subtitle">
            Makine kayıtları, teknik özellikler ve Excel çıktıları
          </p>
        </div>
        <div class="page-stats">
          <div class="header-pill">
            <span>Kayıt</span>
            <strong>{{ totalMachineCount }}</strong>
          </div>
          <div class="header-pill">
            <span>Filtre</span>
            <strong>{{ filteredMachineCount }}</strong>
          </div>
          <div class="header-pill">
            <span>Güç</span>
            <strong>{{ powers.length }}</strong>
          </div>
        </div>
      </div>
      <div v-if="!isBackendConnected" class="status-banner">
        <div>
          <h2 class="status-banner-title">Sunucuya bağlanılamadı</h2>
          <p class="status-banner-text">
            {{ backendMessage }}
          </p>
        </div>
        <button
          type="button"
          class="status-banner-action"
          @click="loadInitialData"
          :disabled="isLoadingInitialData"
        >
          {{ isLoadingInitialData ? "Kontrol ediliyor..." : "Tekrar Dene" }}
        </button>
      </div>
      <div class="content-grid">
        <div class="panel-column">
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
        </div>
        <div class="panel-column">
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
                <strong>{{ filteredMachineCount }}</strong>
              </div>
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
      </div>
      <div class="page-credit">
        Designed by <span>Ali TUMAY</span>
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
  loadInitialData,
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
  isLoadingInitialData,
  isBackendConnected,
  backendMessage,
} = useMachinePage(showToast);
onMounted(async () => {
  await loadInitialData();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 36px 24px 52px;
}

.container {
  max-width: 1520px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.page-header-copy {
  max-width: 760px;
}

.page-eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 18px;
  margin-bottom: 14px;
  border-radius: 999px;
  border: 1px solid var(--border-accent);
  background: rgba(255, 255, 255, 0.72);
  color: var(--accent);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.page-title {
  margin: 0 0 10px;
  font-size: clamp(34px, 4vw, 48px);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.page-subtitle {
  margin: 0;
  max-width: 620px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.page-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
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

.header-pill {
  min-width: 108px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(12px);
}

.header-pill span {
  display: block;
  margin-bottom: 6px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.header-pill strong {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.panel-column {
  min-width: 0;
}

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

.status-banner {
  margin-bottom: 24px;
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(200, 77, 59, 0.18);
  background: linear-gradient(135deg, #fff8ef 0%, #fff3e8 100%);
  color: #9a3412;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: var(--shadow-soft);
}

.status-banner-title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #9a3412;
}

.status-banner-text {
  margin: 0;
  max-width: 760px;
  font-size: 14px;
  line-height: 1.5;
  color: #9a3412;
}

.status-banner-action {
  height: 42px;
  border: 1px solid rgba(200, 77, 59, 0.18);
  border-radius: 12px;
  background: #ffffff;
  color: #9a3412;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  padding: 0 16px;
  cursor: pointer;
  white-space: nowrap;
}

.status-banner-action:disabled {
  opacity: 0.65;
  cursor: not-allowed;
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

.page-credit {
  margin-top: 22px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.page-credit span {
  color: var(--text-primary);
}

@media (max-width: 1180px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-stats {
    justify-content: flex-start;
  }
}

@media (max-width: 700px) {
  .page {
    padding: 20px 14px 32px;
  }

  .page-header {
    gap: 16px;
    margin-bottom: 22px;
  }

  .page-eyebrow {
    min-height: 30px;
    padding: 0 14px;
    margin-bottom: 10px;
    font-size: 11px;
  }

  .list-card {
    padding: 18px;
    border-radius: 18px;
  }

  .page-title {
    font-size: 29px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .page-stats {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .header-pill {
    min-width: 0;
    padding: 14px 12px;
  }

  .header-pill strong {
    font-size: 22px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .status-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .status-banner-action {
    width: 100%;
  }

  .list-card-chip {
    width: 100%;
    justify-content: space-between;
  }

  .page-credit {
    text-align: center;
  }
}
</style>
