import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import MachineTableRow from "./MachineTableRow.vue";

const machine = {
  _id: "m1",
  powerId: { _id: "p1", name: "20KW" },
  tableType: "Çift Tabla",
  machineType: "Kapalı Kasa",
  model: "FC12025",
  imagePath: "uploads/fc12025.png",
  specifications: [
    { key: "Lazer Gücü", value: "20KW" },
    { key: "Çalışma Alanı", value: "12000 x 2550 mm" },
    { key: "Konumlama Hızı", value: "120 m/dk" },
  ],
};

function buildWrapper() {
  return mount(MachineTableRow, {
    props: {
      machine,
      selectedMachineIds: [],
      expandedMachineIds: [],
      isExporting: false,
      isDeleting: false,
    },
  });
}

describe("MachineTableRow", () => {
  it("emits row action and selection events", async () => {
    const wrapper = buildWrapper();
    const checkbox = wrapper.get('input[type="checkbox"]');
    const buttons = wrapper.findAll("button");

    expect(wrapper.text()).toContain("FC12025");
    expect(wrapper.text()).toContain("+ 1 özellik daha");

    await checkbox.setValue(true);
    await buttons[0].trigger("click");
    await buttons[1].trigger("click");
    await buttons[2].trigger("click");
    await buttons[3].trigger("click");
    await buttons[4].trigger("click");

    expect(wrapper.emitted("toggle-selection")?.[0]).toEqual(["m1", true]);
    expect(wrapper.emitted("toggle-expanded")?.[0]).toEqual(["m1"]);
    expect(wrapper.emitted("edit")?.[0]).toEqual([machine]);
    expect(wrapper.emitted("copy")?.[0]).toEqual([machine]);
    expect(wrapper.emitted("export-single")?.[0]).toEqual([machine]);
    expect(wrapper.emitted("delete")?.[0]).toEqual([machine]);
  });
});
