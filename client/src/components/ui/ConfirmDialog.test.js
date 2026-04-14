import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ConfirmDialog from "./ConfirmDialog.vue";

describe("ConfirmDialog", () => {
  it("renders the localized content and emits confirm/cancel", async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        visible: true,
        title: "Makine Silinecek",
        message: "FC12025 silinecek. Emin misiniz?",
        confirmText: "Sil",
        cancelText: "İptal",
      },
    });

    expect(wrapper.text()).toContain("Makine Silinecek");
    expect(wrapper.text()).toContain("FC12025 silinecek. Emin misiniz?");

    const buttons = wrapper.findAll("button");
    await buttons[0].trigger("click");
    await buttons[1].trigger("click");

    expect(wrapper.emitted("cancel")).toHaveLength(1);
    expect(wrapper.emitted("confirm")).toHaveLength(1);
  });
});
