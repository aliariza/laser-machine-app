<template>
  <div class="machine-filters">
    <div class="list-toolbar">
      <div class="toolbar-field toolbar-search">
        <input
          :value="modelSearch"
          type="text"
          placeholder="Model veya anahtar kelime ara..."
          @input="emit('update:modelSearch', $event.target.value)"
        />
      </div>

      <div class="toolbar-field">
        <select
          :value="powerFilter"
          @change="emit('update:powerFilter', $event.target.value)"
        >
          <option value="">Tüm Güçler</option>
          <option v-for="power in powers" :key="power._id" :value="power._id">
            {{ power.name }}
          </option>
        </select>
      </div>

      <div class="toolbar-field">
        <select
          :value="machineTypeFilter"
          @change="emit('update:machineTypeFilter', $event.target.value)"
        >
          <option value="">Tüm Makine Tipleri</option>
          <option value="Açık Kasa">Açık Kasa</option>
          <option value="Kapalı Kasa">Kapalı Kasa</option>
        </select>
      </div>

      <div class="toolbar-actions">
        <button type="button" class="secondary" @click="emit('clear')">
          Filtreleri Temizle
        </button>
      </div>
    </div>

    <div class="list-summary">
      <div class="summary-pill">
        Toplam: <strong>{{ totalCount }}</strong>
      </div>
      <div class="summary-pill">
        Filtrelenen: <strong>{{ filteredCount }}</strong>
      </div>
      <div class="summary-note">
        Sonucu daraltmak için model, güç veya makine tipi seçin.
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  powers: {
    type: Array,
    required: true,
  },
  modelSearch: {
    type: String,
    required: true,
  },
  powerFilter: {
    type: String,
    required: true,
  },
  machineTypeFilter: {
    type: String,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
  filteredCount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits([
  "update:modelSearch",
  "update:powerFilter",
  "update:machineTypeFilter",
  "clear",
]);
</script>

<style scoped>
.list-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1.5fr) 150px 170px auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-field {
  display: flex;
}

.toolbar-field input,
.toolbar-field select {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--border-soft);
  background: rgba(255, 255, 255, 0.8);
  color: var(--text-primary);
  font-size: 13px;
  transition: all 0.18s ease;
  box-sizing: border-box;
}

.toolbar-field input::placeholder {
  color: var(--text-muted);
}

.toolbar-field input:focus,
.toolbar-field select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-focus);
}

.toolbar-actions {
  display: flex;
  justify-content: flex-end;
}

.toolbar-actions .secondary {
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.list-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
  align-items: center;
}

.summary-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 999px;
  background: var(--bg-accent-soft);
  border: 1px solid var(--border-accent);
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 600;
}

.summary-pill strong {
  color: var(--text-primary);
  font-weight: 700;
}

.summary-note {
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 600;
}

.secondary {
  background: var(--bg-muted);
  color: var(--text-secondary);
  border: 1px solid var(--border-soft);
  cursor: pointer;
  transition: all 0.18s ease;
}

.secondary:hover {
  background: #edf3ef;
}

@media (max-width: 1100px) {
  .list-toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }
}
</style>
