<template>
  <div class="specs-section">
    <div class="specs-header">
      <div>
        <h3 class="subsection-title">Teknik Özellikler</h3>
        <p class="subsection-copy">
          Her satıra özellik ve karşılığındaki değeri ekleyin.
        </p>
      </div>
    </div>

    <div
      v-for="(spec, index) in localSpecifications"
      :key="index"
      class="spec-row"
    >
      <input
        v-model="spec.key"
        type="text"
        placeholder="Özellik adı"
        :ref="(el) => setSpecKeyRef(el, index)"
        @input="emitUpdate"
      />

      <input
        v-model="spec.value"
        type="text"
        placeholder="Değer"
        @input="emitUpdate"
      />

      <div class="spec-row-actions">
        <button
          type="button"
          class="secondary form-icon-btn"
          @click="addSpecificationAfter(index)"
          title="Alt satır ekle"
          aria-label="Alt satır ekle"
        >
          <Plus :size="16" />
        </button>

        <button
          type="button"
          class="danger form-icon-btn"
          @click="removeSpecification(index)"
          title="Sil"
          aria-label="Satırı sil"
        >
          <Trash2 :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from "vue";
import { Plus, Trash2 } from "lucide-vue-next";

const props = defineProps({
  specifications: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:specifications"]);

const localSpecifications = ref([]);
const specKeyRefs = ref([]);

watch(
  () => props.specifications,
  (value) => {
    localSpecifications.value = Array.isArray(value)
      ? value.map((item) => ({
          key: item?.key || "",
          value: item?.value || "",
        }))
      : [];
  },
  { immediate: true, deep: true }
);

function emitUpdate() {
  emit(
    "update:specifications",
    localSpecifications.value.map((item) => ({
      key: item.key,
      value: item.value,
    }))
  );
}

function setSpecKeyRef(el, index) {
  if (el) {
    specKeyRefs.value[index] = el;
  }
}

async function addSpecificationAfter(index) {
  localSpecifications.value.splice(index + 1, 0, { key: "", value: "" });
  emitUpdate();

  await nextTick();

  const nextInput = specKeyRefs.value[index + 1];
  if (nextInput) {
    nextInput.focus();
  }
}

function removeSpecification(index) {
  localSpecifications.value.splice(index, 1);

  if (localSpecifications.value.length === 0) {
    localSpecifications.value.push({ key: "", value: "" });
  }

  emitUpdate();
}
</script>

<style scoped>
.specs-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 4px;
  container-type: inline-size;
}

.specs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.subsection-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
}

.subsection-copy {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 12.5px;
  line-height: 1.45;
}

.spec-row {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr) auto;
  gap: 12px;
  align-items: center;
}

.spec-row > * {
  min-width: 0;
}

.spec-row-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--border-soft);
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.18s ease;
  box-sizing: border-box;
}

input::placeholder {
  color: var(--text-muted);
}

input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-focus);
}

button {
  font: inherit;
  height: 44px;
  border-radius: 12px;
  border: 1px solid transparent;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.form-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.form-icon-btn svg {
  flex: 0 0 auto;
  stroke-width: 2;
}

.secondary {
  background: var(--bg-muted);
  color: var(--text-secondary);
  border-color: var(--border-soft);
}

.secondary:hover {
  background: var(--bg-hover);
}

.danger {
  background: var(--danger);
  color: var(--text-inverse);
  border-color: var(--danger);
}

.danger:hover {
  background: var(--danger-strong);
  border-color: var(--danger-strong);
}

@container (max-width: 560px) {
  .spec-row {
    grid-template-columns: 1fr;
  }

  .spec-row-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .spec-row-actions button {
    width: 40px;
    min-width: 40px;
    padding: 0;
    border-radius: 10px;
  }

  .spec-row-actions .secondary {
    background: var(--bg-glass);
  }

  .spec-row-actions .danger {
    background: #dc624d;
    border-color: #dc624d;
  }
}

@container (max-width: 420px) {
  .subsection-copy {
    font-size: 12px;
  }

  .spec-row {
    gap: 9px;
  }

  .spec-row-actions {
    gap: 8px;
  }
}
</style>
