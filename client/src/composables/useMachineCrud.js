import {
  createMachineRequest,
  deleteMachineRequest,
  updateMachineRequest,
} from "../services/machineService";

export function useMachineCrud({
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
}) {
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

    openConfirmDialog(
      {
        title: "Makine Silinecek",
        message: buildDeleteMessage(machine),
        confirmText: "Sil",
        cancelText: "İptal",
      },
      async () => {
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
      }
    );
  }

  return {
    saveMachine,
    deleteMachine,
  };
}
