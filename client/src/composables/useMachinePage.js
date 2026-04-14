// client/src/composables/useMachinePage.js
import { reactive, ref } from "vue";
import { useBackendStatus } from "./useBackendStatus";
import { useConfirmDialog } from "./useConfirmDialog";
import { useMachineCrud } from "./useMachineCrud";
import { useMachineExport } from "./useMachineExport";
import { useMachineListState } from "./useMachineListState";
import { usePowerCrud } from "./usePowerCrud";
import { fetchPowersRequest } from "../services/powerService";
import { fetchMachinesRequest } from "../services/machineService";

export function useMachinePage(showToast = null) {
  function notify(text, variant = "info") {
    if (typeof showToast === "function") {
      showToast(text, variant);
    }
  }
  const powers = ref([]);
  const machines = ref([]);
  const newPowerName = ref("");
  const selectedMachineIds = ref([]);
  const editingMachineId = ref("");
  const expandedMachineIds = ref([]);
  const isSaving = ref(false);
  const isExporting = ref(false);
  const isImporting = ref(false);
  const isDeleting = ref(false);
  const {
    isBackendConnected,
    backendMessage,
    isLoadingInitialData,
    markBackendAvailable,
    setBackendUnavailable,
  } = useBackendStatus();
  const {
    confirmDialogVisible,
    confirmDialogTitle,
    confirmDialogMessage,
    confirmDialogConfirmText,
    confirmDialogCancelText,
    openConfirmDialog,
    closeConfirmDialog,
    confirmDialogAction,
  } = useConfirmDialog();

  const defaultForm = () => ({
    powerId: "",
    tableType: "",
    machineType: "",
    model: "",
    imagePath: "",
    specifications: [{ key: "Lazer Gücü", value: "" }],
  });

  const form = reactive(defaultForm());
  const {
    modelSearch,
    powerFilter,
    machineTypeFilter,
    pageSize,
    currentPage,
    pageSizeOptions,
    filteredMachines,
    totalMachineCount,
    filteredMachineCount,
    totalPages,
    paginatedMachines,
    pageStart,
    pageEnd,
    visiblePageNumbers,
    setPageSize,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    clearFilters,
  } = useMachineListState(machines);

  function resetForm() {
    Object.assign(form, defaultForm());
    editingMachineId.value = "";
  }

  function editMachine(machine) {
    editingMachineId.value = machine._id;

    form.powerId = machine.powerId?._id || "";
    form.tableType = machine.tableType || "";
    form.machineType = machine.machineType || "";
    form.model = machine.model || "";
    form.imagePath = machine.imagePath || "";
    form.specifications = machine.specifications?.length
      ? machine.specifications.map((spec) => ({
          key: spec.key || "",
          value: spec.value || "",
        }))
      : [{ key: "", value: "" }];

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function copyMachine(machine) {
    editingMachineId.value = "";

    form.powerId = machine.powerId?._id || "";
    form.tableType = machine.tableType || "";
    form.machineType = machine.machineType || "";
    form.model = "";
    form.imagePath = machine.imagePath || "";
    form.specifications = machine.specifications?.length
      ? machine.specifications.map((spec) => ({
          key: spec.key || "",
          value: spec.value || "",
        }))
      : [{ key: "", value: "" }];

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleExpanded(machineId) {
    if (expandedMachineIds.value.includes(machineId)) {
      expandedMachineIds.value = expandedMachineIds.value.filter(
        (id) => id !== machineId
      );
    } else {
      expandedMachineIds.value.push(machineId);
    }
  }

  async function fetchPowers() {
    const data = await fetchPowersRequest();
    powers.value = data;
    markBackendAvailable();
  }

  async function fetchMachines() {
    const data = await fetchMachinesRequest();
    machines.value = data;
    markBackendAvailable();
  }

  async function loadInitialData() {
    if (isLoadingInitialData.value) return;

    isLoadingInitialData.value = true;

    try {
      await Promise.all([fetchPowers(), fetchMachines()]);
    } catch (error) {
      powers.value = [];
      machines.value = [];
      setBackendUnavailable();
      notify("Sunucuya bağlanılamadı", "info");
    } finally {
      isLoadingInitialData.value = false;
    }
  }

  const { addPower, deleteSelectedPower } = usePowerCrud({
    powers,
    newPowerName,
    form,
    fetchPowers,
    openConfirmDialog,
    notify,
  });

  const { saveMachine, deleteMachine } = useMachineCrud({
    form,
    editingMachineId,
    selectedMachineIds,
    isSaving,
    isDeleting,
    fetchMachines,
    fetchPowers,
    resetForm,
    openConfirmDialog,
    notify,
  });

  const {
    exportSingleMachine,
    exportExcel,
    exportSelectedExcel,
    importExcel,
  } = useMachineExport({
    selectedMachineIds,
    isExporting,
    isImporting,
    fetchPowers,
    fetchMachines,
    notify,
  });

  return {
    powers,
    machines,
    newPowerName,
    selectedMachineIds,
    editingMachineId,
    expandedMachineIds,
    modelSearch,
    powerFilter,
    machineTypeFilter,
    form,
    filteredMachines,
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
    loadInitialData,
    isSaving,
    isExporting,
    isImporting,
    isDeleting,
    isLoadingInitialData,
    isBackendConnected,
    backendMessage,
    confirmDialogVisible,
    confirmDialogTitle,
    confirmDialogMessage,
    confirmDialogConfirmText,
    confirmDialogCancelText,
    closeConfirmDialog,
    confirmDialogAction,
  };
}
