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
        {{ pageStart }}-{{ pageEnd }} / {{ filteredCount }} kayıt
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
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid #edf2f7;
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
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

.page-size-control select {
  height: 40px;
  min-width: 78px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #dbe3ef;
  background: #ffffff;
  color: #1f2937;
  font: inherit;
}

.range-text {
  color: #64748b;
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
  border: 1px solid #d7e0ec;
  background: #ffffff;
  color: #334155;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
}

.pager-btn:hover:not(:disabled) {
  background: #eef4fb;
}

.pager-btn.active {
  background: #0a84ff;
  border-color: #0a84ff;
  color: #ffffff;
}

.pager-btn.secondary {
  background: #f4f7fb;
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
</style>
