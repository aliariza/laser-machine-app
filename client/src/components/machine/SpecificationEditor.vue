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
      <BaseInput
        :model-value="spec.key"
        placeholder="Özellik adı"
        :ref="(el) => setSpecKeyRef(el, index)"
        @update:modelValue="updateSpecificationKey(index, $event)"
      />

      <BaseInput
        :model-value="spec.value"
        placeholder="Değer"
        @update:modelValue="updateSpecificationValue(index, $event)"
      />

      <div class="spec-row-actions">
        <IconButton
          variant="secondary"
          size="md"
          @click="addSpecificationAfter(index)"
          title="Alt satır ekle"
          aria-label="Alt satır ekle"
        >
          <Plus :size="16" />
        </IconButton>

        <IconButton
          variant="danger"
          size="md"
          @click="removeSpecification(index)"
          title="Sil"
          aria-label="Satırı sil"
        >
          <Trash2 :size="16" />
        </IconButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from "vue";
import { Plus, Trash2 } from "lucide-vue-next";
import BaseInput from "../ui/BaseInput.vue";
import IconButton from "../ui/IconButton.vue";

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
  const inputElement =
    typeof el?.focus === "function" ? el : el?.$el ?? el;

  if (inputElement) {
    specKeyRefs.value[index] = inputElement;
  }
}

function updateSpecificationKey(index, value) {
  localSpecifications.value[index].key = value;
  emitUpdate();
}

function updateSpecificationValue(index, value) {
  localSpecifications.value[index].value = value;
  emitUpdate();
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
  display: inline-flex;
  gap: 8px;
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

  .spec-row-actions :deep(.base-button) {
    width: 40px;
    min-width: 40px;
  }

  .spec-row-actions :deep(.base-button--secondary) {
    background: var(--bg-glass);
  }

  .spec-row-actions :deep(.base-button--danger) {
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
