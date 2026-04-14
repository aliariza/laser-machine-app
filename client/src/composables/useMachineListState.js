import { computed, ref, watch } from "vue";

export function useMachineListState(machines) {
  const modelSearch = ref("");
  const powerFilter = ref("");
  const machineTypeFilter = ref("");
  const pageSize = ref(10);
  const currentPage = ref(1);

  const pageSizeOptions = [5, 10, 20, 50];

  const filteredMachines = computed(() => {
    return machines.value.filter((machine) => {
      const matchesModel =
        !modelSearch.value ||
        (machine.model || "")
          .toLowerCase()
          .includes(modelSearch.value.toLowerCase());

      const matchesPower =
        !powerFilter.value || machine.powerId?._id === powerFilter.value;

      const matchesMachineType =
        !machineTypeFilter.value ||
        machine.machineType === machineTypeFilter.value;

      return matchesModel && matchesPower && matchesMachineType;
    });
  });

  const totalMachineCount = computed(() => machines.value.length);
  const filteredMachineCount = computed(() => filteredMachines.value.length);
  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredMachineCount.value / pageSize.value))
  );
  const paginatedMachines = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;

    return filteredMachines.value.slice(start, end);
  });
  const pageStart = computed(() => {
    if (!filteredMachineCount.value) return 0;
    return (currentPage.value - 1) * pageSize.value + 1;
  });
  const pageEnd = computed(() =>
    Math.min(currentPage.value * pageSize.value, filteredMachineCount.value)
  );
  const visiblePageNumbers = computed(() => {
    const maxVisible = 5;
    const total = totalPages.value;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage.value - half);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  watch([modelSearch, powerFilter, machineTypeFilter], () => {
    currentPage.value = 1;
  });

  watch(pageSize, () => {
    currentPage.value = 1;
  });

  watch([filteredMachineCount, currentPage], () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  });

  function setPageSize(value) {
    const parsed = Number(value);

    if (pageSizeOptions.includes(parsed)) {
      pageSize.value = parsed;
    }
  }

  function goToPage(page) {
    const parsed = Number(page);

    if (!Number.isFinite(parsed)) return;

    currentPage.value = Math.min(Math.max(1, parsed), totalPages.value);
  }

  function goToNextPage() {
    goToPage(currentPage.value + 1);
  }

  function goToPreviousPage() {
    goToPage(currentPage.value - 1);
  }

  function clearFilters() {
    modelSearch.value = "";
    powerFilter.value = "";
    machineTypeFilter.value = "";
    currentPage.value = 1;
  }

  return {
    modelSearch,
    powerFilter,
    machineTypeFilter,
    pageSize,
    currentPage,
    pageSizeOptions,
    filteredMachines,
    totalMachineCount,
    filteredMachineCount,
    totalPages,
    paginatedMachines,
    pageStart,
    pageEnd,
    visiblePageNumbers,
    setPageSize,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    clearFilters,
  };
}
