<template>
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
</template>

<script setup>
defineProps({
  totalCount: {
    type: Number,
    required: true,
  },
  filteredCount: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped>
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

@media (max-width: 700px) {
  .summary-note {
    width: 100%;
    line-height: 1.45;
  }
}
</style>
