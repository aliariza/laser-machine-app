<template>
  <button
    :type="type"
    class="base-button"
    :class="[
      `base-button--${variant}`,
      `base-button--${size}`,
      {
        'base-button--active': active,
        'base-button--block': block,
        'base-button--icon-only': iconOnly,
      },
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: "button",
  },
  variant: {
    type: String,
    default: "neutral",
  },
  size: {
    type: String,
    default: "md",
  },
  active: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
  iconOnly: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.base-button {
  --button-height: 44px;
  --button-padding: 0 16px;
  --button-radius: 12px;
  --button-bg: var(--bg-input);
  --button-color: var(--text-secondary);
  --button-border: var(--border-soft);
  --button-hover-bg: var(--bg-hover);
  --button-hover-border: var(--border-soft);
  --button-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: var(--button-height);
  padding: var(--button-padding);
  border-radius: var(--button-radius);
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  color: var(--button-color);
  font: inherit;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: var(--button-shadow);
}

.base-button:hover:not(:disabled) {
  background: var(--button-hover-bg);
  border-color: var(--button-hover-border);
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.base-button :deep(svg) {
  display: block;
  flex: 0 0 auto;
  stroke-width: 2;
}

.base-button--neutral {
  --button-bg: var(--bg-input);
  --button-color: var(--text-secondary);
  --button-border: var(--border-soft);
  --button-hover-bg: var(--bg-hover);
}

.base-button--secondary {
  --button-bg: var(--bg-muted);
  --button-color: var(--text-secondary);
  --button-border: var(--border-soft);
  --button-hover-bg: var(--bg-hover);
}

.base-button--primary {
  --button-bg: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  --button-color: var(--text-inverse);
  --button-border: var(--accent);
  --button-hover-bg: linear-gradient(135deg, var(--accent-strong) 0%, #123d31 100%);
  --button-hover-border: var(--accent-strong);
  --button-shadow: 0 12px 24px rgba(31, 111, 87, 0.18);
}

.base-button--danger {
  --button-bg: var(--danger);
  --button-color: var(--text-inverse);
  --button-border: var(--danger);
  --button-hover-bg: var(--danger-strong);
  --button-hover-border: var(--danger-strong);
}

.base-button--active {
  --button-bg: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  --button-color: var(--text-inverse);
  --button-border: var(--accent);
}

.base-button--md {
  --button-height: 44px;
  --button-padding: 0 16px;
  --button-radius: 12px;
  font-size: 14px;
}

.base-button--compact {
  --button-height: 40px;
  --button-padding: 0 14px;
  --button-radius: 10px;
  font-size: 13px;
}

.base-button--sm {
  --button-height: 34px;
  --button-padding: 0 10px;
  --button-radius: 10px;
  font-size: 12px;
}

.base-button--xs {
  --button-height: 30px;
  --button-padding: 0 8px;
  --button-radius: 8px;
  font-size: 12px;
}

.base-button--block {
  width: 100%;
}

.base-button--icon-only {
  width: var(--button-height);
  min-width: var(--button-height);
  padding: 0;
}
</style>
