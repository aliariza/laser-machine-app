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
        <div class="field field-wide">
          <label>Güç</label>
          <div class="inline-row">
            <select :value="form.powerId" required @change="updateField('powerId', $event.target.value)">
              <option value="">Güç seçiniz</option>
              <option v-for="power in powers" :key="power._id" :value="power._id">
                {{ power.name }}
              </option>
            </select>

            <input
              :value="newPowerName"
              type="text"
              placeholder="Yeni güç ekle"
              @input="$emit('update:newPowerName', $event.target.value)"
            />

            <button
              type="button"
              class="secondary form-icon-btn"
              @click="$emit('add-power')"
              title="Güç Ekle"
            >
              <Plus :size="16" />
            </button>

            <button
              type="button"
              class="danger form-icon-btn"
              @click="$emit('delete-selected-power')"
              title="Seçileni Sil"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>

        <div class="field">
          <label>Tabla Tipi</label>
          <select :value="form.tableType" required @change="updateField('tableType', $event.target.value)">
            <option value="">Tabla tipi seçiniz</option>
            <option value="Tek Tabla">Tek Tabla</option>
            <option value="Çift Tabla">Çift Tabla</option>
          </select>
        </div>

        <div class="field">
          <label>Makine Tipi</label>
          <select :value="form.machineType" required @change="updateField('machineType', $event.target.value)">
            <option value="">Makine tipi seçiniz</option>
            <option value="Açık Kasa">Açık Kasa</option>
            <option value="Kapalı Kasa">Kapalı Kasa</option>
          </select>
        </div>

        <div class="field">
          <label>Model</label>
          <input
            :value="form.model"
            type="text"
            placeholder="Model giriniz"
            required
            @input="updateField('model', $event.target.value)"
          />
        </div>

        <div class="field">
          <label>Resim Yolu</label>
          <input
            :value="form.imagePath"
            type="text"
            placeholder="uploads/fs3015.png"
            @input="updateField('imagePath', $event.target.value)"
          />
          <small class="field-hint">Opsiyonel. Yalnızca görsel dosya yolunuz varsa doldurun.</small>
        </div>
      </div>

      <SpecificationEditor
        :specifications="form.specifications"
        @update:specifications="updateSpecifications"
      />

      <div class="actions">
        <div class="action-group action-group-primary">
          <button
            type="submit"
            class="primary form-icon-btn"
            :title="editingMachineId ? 'Güncelle' : 'Kaydet'"
            :disabled="isSaving"
          >
            <Save :size="16" />
            <span>{{ isSaving ? "Kaydediliyor..." : editingMachineId ? "Güncelle" : "Kaydet" }}</span>
          </button>

          <button
            type="button"
            class="secondary form-icon-btn"
            @click="$emit('reset')"
            title="Formu Temizle"
            :disabled="isSaving"
          >
            <RotateCcw :size="16" />
            <span>Formu Temizle</span>
          </button>
        </div>

        <div class="action-group">
          <button
            type="button"
            class="secondary form-icon-btn"
            @click="$emit('export-all')"
            title="Tüm Listeyi Excel'e Aktar"
            :disabled="isExporting"
          >
            <FileSpreadsheet :size="16" />
            <span>{{ isExporting ? "Aktarılıyor..." : "Tüm Listeyi Aktar" }}</span>
          </button>

          <button
            type="button"
            class="secondary form-icon-btn"
            @click="$emit('export-selected')"
            title="Seçili Kayıtları Excel'e Aktar"
            :disabled="isExporting"
          >
            <Download :size="16" />
            <span>{{ isExporting ? "Aktarılıyor..." : "Seçili Kayıtları Aktar" }}</span>
          </button>

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
    </form>
  </div>
</template>

<script setup>
import { Download, FileSpreadsheet, Plus, RotateCcw, Save, Trash2, Upload } from "lucide-vue-next";
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

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-wide {
  grid-column: 1 / -1;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.field-hint {
  margin-top: -2px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.inline-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

input,
select,
button,
.upload-button {
  font: inherit;
}

input,
select {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--border-soft);
  background: rgba(255, 255, 255, 0.86);
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.18s ease;
  box-sizing: border-box;
}

input::placeholder {
  color: var(--text-muted);
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-focus);
}

button,
.upload-button {
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
.form-icon-btn span {
  display: inline-block;
}
.form-icon-btn svg {
  flex: 0 0 auto;
  stroke-width: 2;
}
button:disabled,
.upload-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.primary {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: var(--text-inverse);
  border-color: var(--accent);
  box-shadow: 0 12px 24px rgba(31, 111, 87, 0.18);
}

.primary:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, var(--accent-strong) 0%, #123d31 100%);
  border-color: var(--accent-strong);
}

.secondary {
  background: var(--bg-muted);
  color: var(--text-secondary);
  border-color: var(--border-soft);
}

.secondary:hover {
  background: #edf3ef;
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

@media (max-width: 1100px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .field-wide {
    grid-column: auto;
  }

  .inline-row {
    flex-direction: column;
    align-items: stretch;
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

  .field-hint {
    font-size: 11.5px;
  }

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
