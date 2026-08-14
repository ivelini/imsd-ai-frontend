// citySyncAction: синхронизация города между URL и стором (план catalog-city-param)
import { describe, expect, it } from "vitest";
import { citySyncAction } from "@/shared/lib/cityUrl";

describe("citySyncAction", () => {
  it("test_none_when_both_empty", () => {
    expect(citySyncAction(null, null)).toEqual({ type: "none" });
  });

  it("test_set_url_when_store_has_city", () => {
    expect(citySyncAction(null, "ekaterinburg")).toEqual({
      type: "setUrl",
      value: "ekaterinburg",
    });
  });

  it("test_set_store_from_url", () => {
    expect(citySyncAction("ekaterinburg", null)).toEqual({
      type: "setStore",
      value: "ekaterinburg",
    });
  });

  it("test_set_store_when_mismatch", () => {
    expect(citySyncAction("ekaterinburg", "chelyabinsk")).toEqual({
      type: "setStore",
      value: "ekaterinburg",
    });
  });

  it("test_none_when_equal", () => {
    expect(citySyncAction("ekaterinburg", "ekaterinburg")).toEqual({
      type: "none",
    });
  });
});
