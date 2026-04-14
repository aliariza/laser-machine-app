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
        <MachineTableRow
          v-for="machine in machines"
          :key="machine._id"
          :machine="machine"
          :selected-machine-ids="selectedMachineIds"
          :expanded-machine-ids="expandedMachineIds"
          :is-exporting="isExporting"
          :is-deleting="isDeleting"
          @toggle-selection="toggleSelection"
          @toggle-expanded="$emit('toggle-expanded', $event)"
          @edit="$emit('edit', $event)"
          @copy="$emit('copy', $event)"
          @export-single="$emit('export-single', $event)"
          @delete="$emit('delete', $event)"
        />

        <tr v-if="!machines.length">
          <td colspan="7" class="empty-cell">
            <div class="empty-state">
              <strong>Gösterilecek kayıt bulunmuyor.</strong>
              <span>Yeni bir makine ekleyin veya filtreleri temizleyerek listeyi genişletin.</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import MachineTableRow from "./MachineTableRow.vue";

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
  background: var(--bg-table-row);
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
  background: var(--bg-table-row-hover);
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
  border: 1.5px solid var(--checkbox-border);
  border-radius: 3px;
  background-color: var(--bg-checkbox);
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
  border: solid var(--checkbox-check);
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

  .empty-state span {
    max-width: 280px;
  }
}
</style>
