import api from "./api";

export async function fetchMachinesRequest() {
  const { data } = await api.get("/machines");
  return data;
}

export async function createMachineRequest(payload) {
  const { data } = await api.post("/machines", payload);
  return data;
}

export async function updateMachineRequest(machineId, payload) {
  const { data } = await api.put(`/machines/${machineId}`, payload);
  return data;
}

export async function deleteMachineRequest(machineId) {
  const { data } = await api.delete(`/machines/${machineId}`);
  return data;
}

export async function exportSelectedMachinesRequest(machineIds) {
  const response = await api.post(
    "/machines/export/excel/selected",
    { machineIds },
    { responseType: "blob" }
  );
  return response.data;
}

export function getMachineExcelExportUrl(machineId) {
  return `${api.defaults.baseURL}/machines/export/excel/machine/${machineId}`;
}

export async function importMachinesExcelRequest(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/machines/import/excel", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

export function getAllMachinesExcelExportUrl() {
  return `${api.defaults.baseURL}/machines/export/excel/all`;
}

export async function exportAllMachinesRequest() {
  const response = await api.get("/machines/export/excel/all", {
    responseType: "blob",
  });
  return response.data;
}
