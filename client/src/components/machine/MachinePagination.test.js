import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import MachinePagination from "./MachinePagination.vue";

function buildWrapper() {
  return mount(MachinePagination, {
    props: {
      filteredCount: 42,
      currentPage: 2,
      pageSize: 10,
      pageSizeOptions: [5, 10, 20],
      totalPages: 5,
      pageStart: 11,
      pageEnd: 20,
      visiblePageNumbers: [1, 2, 3, 4, 5],
    },
  });
}

describe("MachinePagination", () => {
  it("emits page size and navigation events", async () => {
    const wrapper = buildWrapper();
    const select = wrapper.get("select");
    const buttons = wrapper.findAll("button");

    await select.setValue("20");
    await buttons[0].trigger("click");
    await buttons[2].trigger("click");
    await buttons[buttons.length - 1].trigger("click");

    expect(wrapper.text()).toContain("11-20 arası, toplam 42 kayıt");
    expect(wrapper.emitted("update:pageSize")?.[0]).toEqual([20]);
    expect(wrapper.emitted("previous-page")).toHaveLength(1);
    expect(wrapper.emitted("go-to-page")?.[0]).toEqual([2]);
    expect(wrapper.emitted("next-page")).toHaveLength(1);
  });
});
