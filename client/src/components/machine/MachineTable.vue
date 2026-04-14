<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Seç</th>
          <th>Güç</th>
          <th>Tabla Tipi</th>
          <th>Makine Tipi</th>
          <th>Model</th>
          <th>Teknik Özellikler</th>
          <th>İşlemler</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="machine in machines" :key="machine._id">
          <td class="center-cell">
            <input
              type="checkbox"
              :value="machine._id"
              :checked="selectedMachineIds.includes(machine._id)"
              @change="toggleSelection(machine._id, $event.target.checked)"
            />
          </td>

          <td class="center-cell">
            <span class="badge badge-power">{{ machine.powerId?.name }}</span>
          </td>

          <td class="center-cell">
            <span class="badge badge-table">{{ machine.tableType }}</span>
          </td>

          <td class="center-cell">
            <span class="badge badge-machine">{{ machine.machineType }}</span>
          </td>

          <td class="center-cell">
            <div class="model-text">{{ machine.model }}</div>
            <div v-if="machine.imagePath" class="model-subtext">{{ machine.imagePath }}</div>
          </td>

          <td class="specs-cell">
            <ul class="spec-list">
              <li
                v-for="(spec, index) in visibleSpecifications(machine)"
                :key="index"
              >
                <strong>{{ spec.key }}:</strong> {{ spec.value }}
              </li>
            </ul>

            <div
              v-if="!isExpanded(machine._id) && (machine.specifications?.length || 0) > 2"
              class="spec-more"
            >
              + {{ (machine.specifications?.length || 0) - 2 }} özellik daha
            </div>

            <div v-if="machine.specifications?.length > 2" class="spec-toggle-row">
              <button
                type="button"
                class="secondary small-btn"
                @click="$emit('toggle-expanded', machine._id)"
              >
                {{ isExpanded(machine._id) ? "Daha Az Goster" : "Tum Ozellikleri Goster" }}
              </button>
            </div>
          </td>

          <td class="action-cell-wrap">
            <div class="action-cell">
              <button
                type="button"
                class="secondary icon-btn"
                @click="$emit('edit', machine)"
                title="Düzenle"
              >
                <Pencil :size="15" />
              </button>

              <button
                type="button"
                class="secondary icon-btn"
                @click="$emit('copy', machine)"
                title="Kopyala"
              >
                <Copy :size="15" />
              </button>

              <button
                type="button"
                class="secondary icon-btn"
                @click="$emit('export-single', machine)"
                title="Excel'e Aktar"
                :disabled="isExporting"
              >
                <FileSpreadsheet :size="15" />
              </button>

              <button
                type="button"
                class="danger icon-btn"
                @click="$emit('delete', machine._id)"
                title="Sil"
                :disabled="isDeleting"
              >
                <Trash2 :size="15" />
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="!machines.length">
          <td colspan="7" class="empty-cell">
            <div class="empty-state">
              <strong>Gosterilecek kayit bulunmuyor.</strong>
              <span>Yeni bir makine ekleyin veya filtreleri temizleyerek listeyi genisletin.</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { Copy, FileSpreadsheet, Pencil, Trash2 } from "lucide-vue-next";

const props = defineProps({
  machines: {
    type: Array,
    required: true,
  },
  selectedMachineIds: {
    type: Array,
    required: true,
  },
  expandedMachineIds: {
    type: Array,
    required: true,
  },
  isExporting: {
  type: Boolean,
  default: false,
  },
  isDeleting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:selectedMachineIds",
  "toggle-expanded",
  "edit",
  "copy",
  "export-single",
  "delete",
]);

function isExpanded(machineId) {
  return props.expandedMachineIds.includes(machineId);
}

function visibleSpecifications(machine) {
  if (isExpanded(machine._id)) {
    return machine.specifications || [];
  }
  return (machine.specifications || []).slice(0, 2);
}

function toggleSelection(machineId, checked) {
  const next = checked
    ? [...props.selectedMachineIds, machineId]
    : props.selectedMachineIds.filter((id) => id !== machineId);

  emit("update:selectedMachineIds", [...new Set(next)]);
}
</script>

<style scoped>
.table-wrap {
  overflow-x: auto;
  border-top: 1px solid var(--border-soft);
  padding-top: 12px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  font-size: 14px;
}

thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: left;
  padding: 10px 12px 6px;
  border-bottom: none;
}

thead th:first-child,
thead th:nth-child(2),
thead th:nth-child(3),
thead th:nth-child(4),
thead th:nth-child(5),
thead th:nth-child(6),
thead th:nth-child(7) {
  text-align: center;
}

tbody td {
  padding: 12px 12px;
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
  background: rgba(255, 255, 255, 0.74);
  vertical-align: top;
  color: var(--text-secondary);
}

tbody td:first-child {
  border-left: 1px solid var(--border-soft);
  border-radius: 16px 0 0 16px;
}

tbody td:last-child {
  border-right: 1px solid var(--border-soft);
  border-radius: 0 16px 16px 0;
}

tbody tr:hover td {
  background: rgba(245, 249, 246, 0.98);
}

.center-cell {
  text-align: center;
  vertical-align: middle;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.badge-power {
  background: #dff1e8;
  color: var(--accent-strong);
}

.badge-table {
  background: #edf5e3;
  color: #4a6a20;
}

.badge-machine {
  background: #fff0e3;
  color: #a95522;
}

.model-text {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.model-subtext {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
  word-break: break-word;
}

.specs-cell {
  min-width: 300px;
}

.spec-list {
  margin: 0;
  padding-left: 16px;
  color: var(--text-secondary);
  line-height: 1.35;
  font-size: 12.5px;
}

.spec-list li {
  margin-bottom: 4px;
}

.spec-list strong {
  color: var(--text-primary);
  font-weight: 700;
}

.spec-more {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.spec-toggle-row {
  margin-top: 10px;
}

.spec-toggle-row .small-btn {
  min-width: 72px;
}

.action-cell-wrap {
  text-align: center;
  vertical-align: middle;
}

.action-cell {
  display: grid;
  grid-template-columns: repeat(2, 34px);
  gap: 8px;
  align-content: center;
  justify-content: center;
  margin: 0 auto;
  width: max-content;
}

.small-btn {
  height: 30px;
  min-width: 78px;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
td input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  margin: 0 auto;
  padding: 0;
  border: 1.5px solid rgba(20, 40, 31, 0.2);
  border-radius: 3px;
  background-color: rgba(255, 255, 255, 0.9);
  box-sizing: border-box;
  display: block;
  position: relative;
  cursor: pointer;
  outline: none;
}

td input[type="checkbox"]:checked {
  background-color: var(--accent);
  border-color: var(--accent);
}

td input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.empty-cell {
  padding: 28px 12px;
  background: transparent;
  border: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  text-align: center;
  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 15px;
}

.empty-state span {
  max-width: 420px;
  line-height: 1.5;
}

.icon-btn {
  width: 34px;
  min-width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 10px;
}

.icon-btn svg {
  stroke-width: 2;
}

.secondary {
  background: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-soft);
}

.secondary:hover {
  background: #edf3ef;
}

.danger {
  background: var(--danger);
  color: var(--text-inverse);
  border: 1px solid var(--danger);
}

.danger:hover {
  background: var(--danger-strong);
  border-color: var(--danger-strong);
}

@media (max-width: 700px) {
  table {
    min-width: 760px;
  }

  thead th {
    font-size: 11px;
    padding: 8px 10px 6px;
  }

  tbody td {
    padding: 10px 10px;
  }

  .specs-cell {
    min-width: 240px;
  }

  .spec-list {
    font-size: 12px;
  }

  .action-cell {
    gap: 6px;
  }

  .empty-state span {
    max-width: 280px;
  }
}
</style>
