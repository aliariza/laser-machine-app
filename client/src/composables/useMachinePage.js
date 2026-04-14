// client/src/composables/useMachinePage.js
import { computed, reactive, ref, watch } from "vue";
import {
  addPowerRequest,
  deletePowerRequest,
  fetchPowersRequest,
} from "../services/powerService";
import {
  createMachineRequest,
  deleteMachineRequest,
  exportAllMachinesRequest,
  fetchMachinesRequest,
  getAllMachinesExcelExportUrl,
  getMachineExcelExportUrl,
  getSelectedMachinesExcelExportUrl,
  importMachinesExcelRequest,
  updateMachineRequest,
} from "../services/machineService";


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
  const isLoadingInitialData = ref(false);
  const isBackendConnected = ref(true);
  const backendMessage = ref("");

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
    isBackendConnected.value = true;
    backendMessage.value = "";
  }

  async function fetchMachines() {
    const data = await fetchMachinesRequest();
    machines.value = data;
    isBackendConnected.value = true;
    backendMessage.value = "";
  }

  function setBackendUnavailable() {
    isBackendConnected.value = false;
    backendMessage.value =
      "Backend not connected yet. The interface is live, but saving and loading records will work after the API is deployed.";
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
      notify("Backend not connected yet", "info");
    } finally {
      isLoadingInitialData.value = false;
    }
  }

async function addPower() {
  const value = newPowerName.value.trim().toUpperCase();
  if (!value) return;

  try {
    await addPowerRequest(value);
    newPowerName.value = "";
    await fetchPowers();
    notify("Güç başarıyla eklendi", "success");
  } catch (error) {
    notify(error?.response?.data?.message || "Güç eklenemedi", "error");
  }
}

async function deleteSelectedPower() {
  if (!form.powerId) {
    notify("Lütfen silmek için bir güç seçin", "error");
    return;
  }
  try {
    await deletePowerRequest(form.powerId);
    form.powerId = "";
    await fetchPowers();
    notify("Güç silindi", "success");
  } catch (error) {
    notify(error?.response?.data?.message || "Güç silinemedi", "error");
  }
}

async function saveMachine() {
  if (isSaving.value) return;

  isSaving.value = true;

  try {
    const isEditing = !!editingMachineId.value;

    const payload = {
      ...form,
      specifications: form.specifications.filter(
        (item) => item.key.trim() && item.value.trim()
      ),
    };

    if (isEditing) {
      await updateMachineRequest(editingMachineId.value, payload);
    } else {
      await createMachineRequest(payload);
    }

    resetForm();
    await fetchMachines();
    notify(isEditing ? "Makine güncellendi" : "Makine kaydedildi", "success");
  } catch (error) {
    notify(error?.response?.data?.message || "Makine kaydedilemedi", "error");
  } finally {
    isSaving.value = false;
  }
}
function buildDeleteMessage(machine) {
  const model = machine?.model?.trim() || "Bu makine";
  const power = machine?.powerId?.name?.trim() || "";
  const machineType = machine?.machineType?.trim() || "";

  const detailParts = [model, power, machineType].filter(Boolean);
  const detailText = detailParts.join(" ");

  return `${detailText} silinecek. Emin misiniz?\nBu işlemin geri dönüşü yoktur.`;
}

async function deleteMachine(machine) {
  if (isDeleting.value) return;

  if (!machine?._id) {
    notify("Silinecek makine bilgisi bulunamadı", "error");
    return;
  }

  const confirmed = window.confirm(buildDeleteMessage(machine));
  if (!confirmed) return;

  isDeleting.value = true;

  try {
    await deleteMachineRequest(machine._id);
    selectedMachineIds.value = selectedMachineIds.value.filter(
      (id) => id !== machine._id
    );
    await fetchMachines();
    await fetchPowers();
    notify("Makine silindi", "success");
  } catch (error) {
    notify(error?.response?.data?.message || "Makine silinemedi", "error");
  } finally {
    isDeleting.value = false;
  }
}  function buildExportFileName(machine) {
    const safePower = (machine?.powerId?.name || "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");

    const safeModel = (machine?.model || "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");

    return `${safePower}_${safeModel}_TEKNIK_OZELLIKLER.xlsx`;
  }

  function downloadExcelBlob(blobData, fileName) {
    const blob = new Blob([blobData], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  function downloadExcelFromUrl(url) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

async function exportSingleMachine(machine) {
  if (isExporting.value) return;

  isExporting.value = true;

  try {
    downloadExcelFromUrl(getMachineExcelExportUrl(machine._id));
    notify("Excel dışa aktarma tamamlandı", "success");
  } catch (error) {
    notify("Excel dışa aktarma başarısız", "error");
  } finally {
    isExporting.value = false;
  }
}
async function exportExcel() {
  if (isExporting.value) return;

  isExporting.value = true;

  try {
    downloadExcelFromUrl(getAllMachinesExcelExportUrl());
    notify("Tüm makineler Excel'e aktarıldı", "success");
  } catch (error) {
    notify("Tüm makineler Excel'e aktarılamadı", "error");
  } finally {
    isExporting.value = false;
  }
}
async function exportSelectedExcel() {
  if (!selectedMachineIds.value.length) {
    notify("Lütfen Excel'e aktarmak için en az bir makine seçin", "error");
    return;
  }

  if (isExporting.value) return;

  isExporting.value = true;

  try {
    downloadExcelFromUrl(
      getSelectedMachinesExcelExportUrl(selectedMachineIds.value)
    );
    notify("Seçilen makineler Excel'e aktarıldı", "success");
  } catch (error) {
    notify("Seçilen makineler Excel'e aktarılamadı", "error");
  } finally {
    isExporting.value = false;
  }
}
async function importExcel(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (isImporting.value) return;

  isImporting.value = true;

  try {
    await importMachinesExcelRequest(file);
    await fetchPowers();
    await fetchMachines();
    event.target.value = "";
    notify("Excel içe aktarma tamamlandı", "success");
  } catch (error) {
    notify(
      error?.response?.data?.message || "Excel içe aktarma başarısız",
      "error"
    );
  } finally {
    isImporting.value = false;
  }
}
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
  };
}
