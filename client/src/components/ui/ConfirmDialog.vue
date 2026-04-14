<template>
  <div v-if="visible" class="confirm-overlay" @click.self="$emit('cancel')">
    <div
      class="confirm-dialog"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="messageId"
    >
      <h2 :id="titleId" class="confirm-title">{{ title }}</h2>
      <p :id="messageId" class="confirm-message">{{ message }}</p>

      <div class="confirm-actions">
        <BaseButton
          type="button"
          variant="secondary"
          size="md"
          class="cancel-btn"
          @click="$emit('cancel')"
        >
          {{ cancelText }}
        </BaseButton>
        <BaseButton
          type="button"
          variant="danger"
          size="md"
          class="confirm-btn"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import BaseButton from "./BaseButton.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  message: {
    type: String,
    default: "",
  },
  confirmText: {
    type: String,
    default: "Sil",
  },
  cancelText: {
    type: String,
    default: "İptal",
  },
});

defineEmits(["cancel", "confirm"]);

const titleId = computed(() => `confirm-title-${props.title.length || 0}`);
const messageId = computed(() => `confirm-message-${props.message.length || 0}`);
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(7, 12, 10, 0.56);
  backdrop-filter: blur(8px);
}

.confirm-dialog {
  width: min(100%, 420px);
  padding: 24px;
  border-radius: 22px;
  border: 1px solid var(--border-soft);
  background: var(--bg-surface-strong);
  color: var(--text-primary);
  box-shadow: var(--shadow-card);
}

.confirm-title {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 700;
}

.confirm-message {
  margin: 0;
  white-space: pre-line;
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.confirm-actions :deep(.base-button) {
  min-width: 110px;
}

@media (max-width: 640px) {
  .confirm-dialog {
    padding: 20px;
    border-radius: 18px;
  }

  .confirm-actions {
    flex-direction: column-reverse;
  }

  .confirm-actions :deep(.base-button) {
    width: 100%;
  }
}
</style>
