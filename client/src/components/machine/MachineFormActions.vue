<template>
  <div class="actions">
    <div class="action-group action-group-primary">
      <BaseButton
        type="submit"
        variant="primary"
        size="md"
        class="form-icon-btn"
        :title="editingMachineId ? 'Güncelle' : 'Kaydet'"
        :disabled="isSaving"
      >
        <Save :size="16" />
        <span>{{ isSaving ? "Kaydediliyor..." : editingMachineId ? "Güncelle" : "Kaydet" }}</span>
      </BaseButton>

      <BaseButton
        variant="secondary"
        size="md"
        class="form-icon-btn"
        @click="$emit('reset')"
        title="Formu Temizle"
        :disabled="isSaving"
      >
        <RotateCcw :size="16" />
        <span>Formu Temizle</span>
      </BaseButton>
    </div>

    <div class="action-group">
      <BaseButton
        variant="secondary"
        size="md"
        class="form-icon-btn"
        @click="$emit('export-all')"
        title="Tüm Listeyi Excel'e Aktar"
        :disabled="isExporting"
      >
        <FileSpreadsheet :size="16" />
        <span>{{ isExporting ? "Aktarılıyor..." : "Tüm Listeyi Aktar" }}</span>
      </BaseButton>

      <BaseButton
        variant="secondary"
        size="md"
        class="form-icon-btn"
        @click="$emit('export-selected')"
        title="Seçili Kayıtları Excel'e Aktar"
        :disabled="isExporting"
      >
        <Download :size="16" />
        <span>{{ isExporting ? "Aktarılıyor..." : "Seçili Kayıtları Aktar" }}</span>
      </BaseButton>

      <label
        class="upload-button secondary form-icon-btn"
        title="Excel'den Toplu İçe Aktar"
        :class="{ disabled: isImporting }"
      >
        <Upload :size="16" />
        <span>{{ isImporting ? "İçe Aktarılıyor..." : "Excel'den İçe Aktar" }}</span>
        <input type="file" accept=".xlsx" @change="$emit('import', $event)" hidden :disabled="isImporting" />
      </label>
    </div>
  </div>
</template>

<script setup>
import {
  Download,
  FileSpreadsheet,
  RotateCcw,
  Save,
  Upload,
} from "lucide-vue-next";
import BaseButton from "../ui/BaseButton.vue";

defineProps({
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

defineEmits(["reset", "export-all", "export-selected", "import"]);
</script>

<style scoped>
.actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 4px;
}

.action-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.action-group-primary {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-soft);
}

.form-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.form-icon-btn span {
  display: inline-block;
}

.form-icon-btn :deep(svg) {
  flex: 0 0 auto;
}

.upload-button {
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

.upload-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.upload-button.secondary {
  background: var(--bg-muted);
  color: var(--text-secondary);
  border-color: var(--border-soft);
}

.upload-button.secondary:hover {
  background: var(--bg-hover);
}

@media (max-width: 700px) {
  .action-group {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    gap: 12px;
  }

  .actions .form-icon-btn,
  .upload-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
