import { ref } from "vue";

export function useBackendStatus() {
  const isBackendConnected = ref(true);
  const backendMessage = ref("");
  const isLoadingInitialData = ref(false);

  function markBackendAvailable() {
    isBackendConnected.value = true;
    backendMessage.value = "";
  }

  function setBackendUnavailable() {
    isBackendConnected.value = false;
    backendMessage.value =
      "Arayüz hazır, ancak kayıtları görmek ve kaydetmek için sunucu bağlantısının kurulması gerekiyor.";
  }

  return {
    isBackendConnected,
    backendMessage,
    isLoadingInitialData,
    markBackendAvailable,
    setBackendUnavailable,
  };
}
