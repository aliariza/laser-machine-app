// client/src/composables/useMachinePage.js
import { computed, reactive, ref, watch } from "vue";
import { useBackendStatus } from "./useBackendStatus";
import { useConfirmDialog } from "./useConfirmDialog";
import { useMachineCrud } from "./useMachineCrud";
import { useMachineExport } from "./useMachineExport";
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
  const modelSearch = ref("");
  const powerFilter = ref("");
  const machineTypeFilter = ref("");
  const pageSize = ref(10);
  const currentPage = ref(1);

  const pageSizeOptions = [5, 10, 20, 50];

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

  const filteredMachines = computed(() => {
    return machines.value.filter((machine) => {
      const matchesModel =
        !modelSearch.value ||
        (machine.model || "")
          .toLowerCase()
          .includes(modelSearch.value.toLowerCase());

      const matchesPower =
        !powerFilter.value || machine.powerId?._id === powerFilter.value;

      const matchesMachineType =
        !machineTypeFilter.value ||
        machine.machineType === machineTypeFilter.value;

      return matchesModel && matchesPower && matchesMachineType;
    });
  });

  const totalMachineCount = computed(() => machines.value.length);
  const filteredMachineCount = computed(() => filteredMachines.value.length);
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredMachineCount.value / pageSize.value))
  );
  const paginatedMachines = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;

    return filteredMachines.value.slice(start, end);
  });
  const pageStart = computed(() => {
    if (!filteredMachineCount.value) return 0;
    return (currentPage.value - 1) * pageSize.value + 1;
  });
  const pageEnd = computed(() =>
    Math.min(currentPage.value * pageSize.value, filteredMachineCount.value)
  );
  const visiblePageNumbers = computed(() => {
    const maxVisible = 5;
    const total = totalPages.value;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage.value - half);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  watch([modelSearch, powerFilter, machineTypeFilter], () => {
    currentPage.value = 1;
  });

  watch(pageSize, () => {
    currentPage.value = 1;
  });

  watch([filteredMachineCount, currentPage], () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  });

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

  function setPageSize(value) {
    const parsed = Number(value);

    if (pageSizeOptions.includes(parsed)) {
      pageSize.value = parsed;
    }
  }

  function goToPage(page) {
    const parsed = Number(page);

    if (!Number.isFinite(parsed)) return;

    currentPage.value = Math.min(Math.max(1, parsed), totalPages.value);
  }

  function goToNextPage() {
    goToPage(currentPage.value + 1);
  }

  function goToPreviousPage() {
    goToPage(currentPage.value - 1);
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

  function clearFilters() {
    modelSearch.value = "";
    powerFilter.value = "";
    machineTypeFilter.value = "";
    currentPage.value = 1;
  }

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
