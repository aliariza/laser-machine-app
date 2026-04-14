<template>
  <tr>
    <td class="center-cell">
      <input
        type="checkbox"
        :value="machine._id"
        :checked="selectedMachineIds.includes(machine._id)"
        @change="emit('toggle-selection', machine._id, $event.target.checked)"
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
        <li v-for="(spec, index) in visibleSpecifications" :key="index">
          <strong>{{ spec.key }}:</strong> {{ spec.value }}
        </li>
      </ul>

      <div
        v-if="!isExpanded && (machine.specifications?.length || 0) > 2"
        class="spec-more"
      >
        + {{ (machine.specifications?.length || 0) - 2 }} özellik daha
      </div>

      <div v-if="machine.specifications?.length > 2" class="spec-toggle-row">
        <BaseButton
          variant="secondary"
          size="xs"
          class="small-btn"
          @click="emit('toggle-expanded', machine._id)"
          :aria-label="isExpanded ? 'Daha az göster' : 'Tüm özellikleri göster'"
        >
          {{ isExpanded ? "Daha Az Göster" : "Tüm Özellikleri Göster" }}
        </BaseButton>
      </div>
    </td>

    <td class="action-cell-wrap">
      <div class="action-cell">
        <IconButton
          variant="secondary"
          size="sm"
          @click="emit('edit', machine)"
          title="Düzenle"
          aria-label="Kaydı düzenle"
        >
          <Pencil :size="15" />
        </IconButton>

        <IconButton
          variant="secondary"
          size="sm"
          @click="emit('copy', machine)"
          title="Kopyala"
          aria-label="Kaydı kopyala"
        >
          <Copy :size="15" />
        </IconButton>

        <IconButton
          variant="secondary"
          size="sm"
          @click="emit('export-single', machine)"
          title="Excel'e Aktar"
          :disabled="isExporting"
          aria-label="Kaydı Excel'e aktar"
        >
          <FileSpreadsheet :size="15" />
        </IconButton>

        <IconButton
          variant="danger"
          size="sm"
          @click="emit('delete', machine)"
          title="Sil"
          :disabled="isDeleting"
          aria-label="Kaydı sil"
        >
          <Trash2 :size="15" />
        </IconButton>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from "vue";
import { Copy, FileSpreadsheet, Pencil, Trash2 } from "lucide-vue-next";
import BaseButton from "../ui/BaseButton.vue";
import IconButton from "../ui/IconButton.vue";

const props = defineProps({
  machine: {
    type: Object,
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
  "toggle-selection",
  "toggle-expanded",
  "edit",
  "copy",
  "export-single",
  "delete",
]);

const isExpanded = computed(() =>
  props.expandedMachineIds.includes(props.machine._id)
);

const visibleSpecifications = computed(() => {
  if (isExpanded.value) {
    return props.machine.specifications || [];
  }

  return (props.machine.specifications || []).slice(0, 2);
});
</script>

<style scoped>
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
  background: var(--badge-power-bg);
  color: var(--badge-power-text);
}

.badge-table {
  background: var(--badge-table-bg);
  color: var(--badge-table-text);
}

.badge-machine {
  background: var(--badge-machine-bg);
  color: var(--badge-machine-text);
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
  min-width: 78px;
  font-weight: 600;
}

@media (max-width: 700px) {
  .specs-cell {
    min-width: 240px;
  }

  .spec-list {
    font-size: 12px;
  }

  .action-cell {
    gap: 6px;
  }
}
</style>
