import {
  addPowerRequest,
  deletePowerRequest,
} from "../services/powerService";

export function usePowerCrud({
  powers,
  newPowerName,
  form,
  fetchPowers,
  openConfirmDialog,
  notify,
}) {
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

    const selectedPower = powers.value.find((power) => power._id === form.powerId);
    const powerName = selectedPower?.name || "Seçili güç";

    openConfirmDialog(
      {
        title: "Güç Silinecek",
        message: `${powerName} silinecek. Emin misiniz?\nBu işlemin geri dönüşü yoktur.`,
        confirmText: "Sil",
        cancelText: "İptal",
      },
      async () => {
        try {
          await deletePowerRequest(form.powerId);
          form.powerId = "";
          await fetchPowers();
          notify("Güç silindi", "success");
        } catch (error) {
          notify(error?.response?.data?.message || "Güç silinemedi", "error");
        }
      }
    );
  }

  return {
    addPower,
    deleteSelectedPower,
  };
}
