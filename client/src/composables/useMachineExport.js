import {
  getAllMachinesExcelExportUrl,
  getMachineExcelExportUrl,
  getSelectedMachinesExcelExportUrl,
  importMachinesExcelRequest,
} from "../services/machineService";

export function useMachineExport({
  selectedMachineIds,
  isExporting,
  isImporting,
  fetchPowers,
  fetchMachines,
  notify,
}) {
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

  return {
    exportSingleMachine,
    exportExcel,
    exportSelectedExcel,
    importExcel,
  };
}
