<template>
  <div class="pagination-bar" v-if="filteredCount > 0">
    <div class="pagination-summary">
      <label class="page-size-control">
        <span>Sayfa başına</span>
        <select
          :value="pageSize"
          @change="emit('update:pageSize', Number($event.target.value))"
        >
          <option
            v-for="option in pageSizeOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </label>

      <div class="range-text">
        {{ pageStart }}-{{ pageEnd }} arası, toplam {{ filteredCount }} kayıt
      </div>
    </div>

    <div class="pagination-controls">
      <button
        type="button"
        class="pager-btn secondary"
        @click="emit('previous-page')"
        :disabled="currentPage <= 1"
      >
        Önceki
      </button>

      <button
        v-for="page in visiblePageNumbers"
        :key="page"
        type="button"
        class="pager-btn"
        :class="{ active: page === currentPage }"
        @click="emit('go-to-page', page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        class="pager-btn secondary"
        @click="emit('next-page')"
        :disabled="currentPage >= totalPages"
      >
        Sonraki
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  filteredCount: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  pageSize: {
    type: Number,
    required: true,
  },
  pageSizeOptions: {
    type: Array,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  pageStart: {
    type: Number,
    required: true,
  },
  pageEnd: {
    type: Number,
    required: true,
  },
  visiblePageNumbers: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits([
  "update:pageSize",
  "go-to-page",
  "previous-page",
  "next-page",
]);
</script>

<style scoped>
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--border-soft);
}

.pagination-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.page-size-control {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
}

.page-size-control select {
  height: 40px;
  min-width: 78px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--border-soft);
  background: rgba(255, 255, 255, 0.86);
  color: var(--text-primary);
  font: inherit;
}

.range-text {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.pager-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--border-soft);
  background: rgba(255, 255, 255, 0.86);
  color: var(--text-secondary);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
}

.pager-btn:hover:not(:disabled) {
  background: #edf3ef;
}

.pager-btn.active {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  border-color: var(--accent);
  color: var(--text-inverse);
}

.pager-btn.secondary {
  background: var(--bg-muted);
}

.pager-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .pagination-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: flex-start;
  }
}

@media (max-width: 700px) {
  .pagination-summary {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .page-size-control {
    justify-content: space-between;
  }

  .page-size-control select {
    min-width: 88px;
  }

  .pagination-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(56px, 1fr));
    gap: 8px;
  }

  .pager-btn {
    width: 100%;
    padding: 0 10px;
  }
}
</style>
