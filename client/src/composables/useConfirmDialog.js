import { ref } from "vue";

export function useConfirmDialog() {
  const confirmDialogVisible = ref(false);
  const confirmDialogTitle = ref("");
  const confirmDialogMessage = ref("");
  const confirmDialogConfirmText = ref("Sil");
  const confirmDialogCancelText = ref("İptal");
  const pendingConfirmAction = ref(null);

  function openConfirmDialog(
    {
      title = "Onay Gerekli",
      message = "",
      confirmText = "Sil",
      cancelText = "İptal",
    },
    onConfirm
  ) {
    confirmDialogTitle.value = title;
    confirmDialogMessage.value = message;
    confirmDialogConfirmText.value = confirmText;
    confirmDialogCancelText.value = cancelText;
    pendingConfirmAction.value = onConfirm;
    confirmDialogVisible.value = true;
  }

  function closeConfirmDialog() {
    confirmDialogVisible.value = false;
    confirmDialogTitle.value = "";
    confirmDialogMessage.value = "";
    confirmDialogConfirmText.value = "Sil";
    confirmDialogCancelText.value = "İptal";
    pendingConfirmAction.value = null;
  }

  async function confirmDialogAction() {
    const action = pendingConfirmAction.value;
    closeConfirmDialog();

    if (typeof action === "function") {
      await action();
    }
  }

  return {
    confirmDialogVisible,
    confirmDialogTitle,
    confirmDialogMessage,
    confirmDialogConfirmText,
    confirmDialogCancelText,
    openConfirmDialog,
    closeConfirmDialog,
    confirmDialogAction,
  };
}
