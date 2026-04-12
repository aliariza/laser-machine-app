<template>
  <div class="specs-section">
    <div class="specs-header">
      <h3 class="subsection-title">Teknik Özellikler</h3>
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
        >
          <Plus :size="16" />
        </button>

        <button
          type="button"
          class="danger form-icon-btn"
          @click="removeSpecification(index)"
          title="Sil"
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
  color: #1f2937;
}

.spec-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: center;
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
  border: 1px solid #dbe3ef;
  background: #ffffff;
  color: #1f2937;
  font-size: 14px;
  transition: all 0.18s ease;
  box-sizing: border-box;
}

input::placeholder {
  color: #94a3b8;
}

input:focus {
  outline: none;
  border-color: #0a84ff;
  box-shadow: 0 0 0 4px rgba(10, 132, 255, 0.12);
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
  background: #f4f7fb;
  color: #334155;
  border-color: #d7e0ec;
}

.secondary:hover {
  background: #eaf0f8;
}

.danger {
  background: #e02424;
  color: #ffffff;
  border-color: #e02424;
}

.danger:hover {
  background: #c81e1e;
  border-color: #c81e1e;
}

@media (max-width: 1100px) {
  .spec-row {
    grid-template-columns: 1fr;
  }

  .spec-row-actions {
    justify-content: flex-end;
  }
}
</style>