import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import MachineFilters from "./MachineFilters.vue";

function buildWrapper() {
  return mount(MachineFilters, {
    props: {
      powers: [
        { _id: "p1", name: "6KW" },
        { _id: "p2", name: "20KW" },
      ],
      modelSearch: "",
      powerFilter: "",
      machineTypeFilter: "",
      totalCount: 12,
      filteredCount: 5,
    },
  });
}

describe("MachineFilters", () => {
  it("emits filter updates and clear events", async () => {
    const wrapper = buildWrapper();
    const inputs = wrapper.findAll("input");
    const selects = wrapper.findAll("select");
    const button = wrapper.get("button");

    await inputs[0].setValue("FC");
    await selects[0].setValue("p2");
    await selects[1].setValue("Kapalı Kasa");
    await button.trigger("click");

    expect(wrapper.emitted("update:modelSearch")?.[0]).toEqual(["FC"]);
    expect(wrapper.emitted("update:powerFilter")?.[0]).toEqual(["p2"]);
    expect(wrapper.emitted("update:machineTypeFilter")?.[0]).toEqual([
      "Kapalı Kasa",
    ]);
    expect(wrapper.emitted("clear")).toHaveLength(1);
  });
});
