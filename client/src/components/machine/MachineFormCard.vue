<template>
  <div class="form-card">
    <div class="card-header">
      <div>
        <h2 class="section-title">Teknik Veri Girişi</h2>
        <p class="section-copy">
          Yeni makine oluşturun, mevcut kayıtları düzenleyin ve Excel akışlarını yönetin.
        </p>
      </div>
    </div>

    <form class="machine-form" @submit.prevent="$emit('save')">
      <div class="grid">
        <PowerFieldRow
          :powers="powers"
          :power-id="form.powerId"
          :new-power-name="newPowerName"
          @update:powerId="updateField('powerId', $event)"
          @update:newPowerName="$emit('update:newPowerName', $event)"
          @add-power="$emit('add-power')"
          @delete-selected-power="$emit('delete-selected-power')"
        />

        <MachineBasicFields
          :form="form"
          @update:tableType="updateField('tableType', $event)"
          @update:machineType="updateField('machineType', $event)"
          @update:model="updateField('model', $event)"
          @update:imagePath="updateField('imagePath', $event)"
        />
      </div>

      <SpecificationEditor
        :specifications="form.specifications"
        @update:specifications="updateSpecifications"
      />

      <MachineFormActions
        :editing-machine-id="editingMachineId"
        :is-saving="isSaving"
        :is-exporting="isExporting"
        :is-importing="isImporting"
        @reset="$emit('reset')"
        @export-all="$emit('export-all')"
        @export-selected="$emit('export-selected')"
        @import="$emit('import', $event)"
      />
    </form>
  </div>
</template>

<script setup>
import MachineBasicFields from "./MachineBasicFields.vue";
import MachineFormActions from "./MachineFormActions.vue";
import PowerFieldRow from "./PowerFieldRow.vue";
import SpecificationEditor from "./SpecificationEditor.vue";

const props = defineProps({
  powers: {
    type: Array,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  newPowerName: {
    type: String,
    required: true,
  },
  editingMachineId: {
    type: String,
    default: "",
  },
  isSaving: {
  type: Boolean,
  default: false,
  },
  isExporting: {
  type: Boolean,
  default: false,
  },
  isImporting: {
  type: Boolean,
  default: false,
  },
});

const emit = defineEmits([
  "update:form",
  "update:newPowerName",
  "add-power",
  "delete-selected-power",
  "save",
  "reset",
  "export-all",
  "export-selected",
  "import",
]);

function updateField(field, value) {
  emit("update:form", {
    ...props.form,
    [field]: value,
  });
}

function updateSpecifications(specifications) {
  emit("update:form", {
    ...props.form,
    specifications,
  });
}
</script>

<style scoped>
.form-card {
  position: sticky;
  top: 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(16px);
  padding: 26px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.section-copy {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.machine-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

@media (max-width: 1100px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .form-card {
    padding: 18px;
    border-radius: 18px;
    position: static;
  }

  .section-title {
    font-size: 18px;
  }

  .section-copy {
    font-size: 12.5px;
  }
}
</style>
