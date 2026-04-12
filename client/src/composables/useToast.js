import { ref } from "vue";

const visible = ref(false);
const message = ref("");
const type = ref("info");
let hideTimer = null;

export function useToast() {
  function showToast(text, variant = "info", duration = 2500) {
    message.value = text;
    type.value = variant;
    visible.value = true;

    if (hideTimer) {
      clearTimeout(hideTimer);
    }

    hideTimer = window.setTimeout(() => {
      visible.value = false;
    }, duration);
  }

  function hideToast() {
    visible.value = false;
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  return {
    toastVisible: visible,
    toastMessage: message,
    toastType: type,
    showToast,
    hideToast,
  };
}