import api from "./api";

export async function fetchPowersRequest() {
  const { data } = await api.get("/powers");
  return data;
}

export async function addPowerRequest(name) {
  const { data } = await api.post("/powers", { name });
  return data;
}

export async function deletePowerRequest(powerId) {
  const { data } = await api.delete(`/powers/${powerId}`);
  return data;
}