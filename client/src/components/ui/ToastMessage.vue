<template>
  <transition name="toast-fade">
    <div v-if="visible" class="toast-wrap">
      <div class="toast" :class="variantClass">
        <span class="toast-text">{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "info", // info | success | error
  },
});

const variantClass = computed(() => {
  if (props.type === "success") return "toast-success";
  if (props.type === "error") return "toast-error";
  return "toast-info";
});
</script>

<style scoped>
.toast-wrap {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
}

.toast {
  min-width: 260px;
  max-width: 420px;
  padding: 14px 16px;
  border-radius: 14px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.16);
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.toast-text {
  display: block;
}

.toast-success {
  background: #ecfdf3;
  color: #166534;
  border-color: #bbf7d0;
}

.toast-error {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.toast-info {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>