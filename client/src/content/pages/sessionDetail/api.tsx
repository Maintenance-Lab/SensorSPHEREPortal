const apiRequest = async (url: string, method: string, body?: object) => {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        credentials: 'include',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      console.error(`API request failed: ${url}`);
      throw new Error(`Failed to fetch: ${url}`);
    }

    return res.json();
};

export const fetchDevices =  async (sessionId: number) =>
    apiRequest(`/api/devices/all/${sessionId}`, "GET");

export const removeDevicesFromSession = async (sessionId: number, selectedDeviceIds: number[]) => {
    return apiRequest("/api/sessions/removeFromSession", "DELETE", {
      sessionId,
      deviceIds: selectedDeviceIds,
    });
};

export const sendConfiguration = async (sessionId: number, selectedDeviceId: number) => {
    return apiRequest("/api/devices/sendConfiguration", "PUT", {
      sessionId,
      selectedDevice: selectedDeviceId,
    });
};

export const updateSession = async (sessionId: number, name: string, description: string, archived: boolean) => {
    return apiRequest(`/api/sessions/update/${sessionId}`, "PUT", {
      name,
      description,
      archived,
    });
}

export const deleteSession = async (sessionId: number) => {
    return apiRequest("/api/sessions/delete", "POST",{
      ids: [sessionId]
  });
}

export const addDevices = async (sessionId: number, selectedAddDeviceIds: number[]) => {
    return apiRequest("/api/devices/addToSession", "POST", {
      sessionId,
      deviceIds: selectedAddDeviceIds,
    });
}

export const getDeviceProperties = async (deviceId: string) => {
    return apiRequest(`/api/devices/properties/${deviceId}`, "GET");
};

export const getSelectedProperties = async (deviceId: string, sessionId: number) => {
  console.log("getSelectedProperties voor in api aaroepen: ", deviceId, sessionId);
  return apiRequest(`/api/devices/selectedProperties/${sessionId}/${deviceId}`, "GET");
  // return apiRequest("/api/devices/hello", "GET");
  console.log("sent api request");
}


export const updateSelectedProperties = async (deviceId: string, sessionId: number, selectedProperties: string[]) => {
  console.log("updateSelectedProperties: ", deviceId, sessionId, selectedProperties);
    return apiRequest("/api/devices/updateSelectedProperties", "PUT", {
      deviceId,
      sessionId,
      selectedProperties,
    });
}

export const fetchAvailableDevices = async (sessionId: number) => {
    const res = await apiRequest(`/api/devices/available/${sessionId}`, "GET");
    if (!res) return [];
    return res;
}

export const fetchSession = async (sessionId: number) => {
    const res = await apiRequest(`/api/sessions/id/${sessionId}`, "GET");
    if (!res) return [];
    return res;
}

export const projectData = async (projectId: number) => {
    const res = await apiRequest(`/api/projects/id/${projectId}`, "GET");
    if (!res) return [];
    return res;
}

export const listUnits = async () => {
    const res = await apiRequest("/api/devices/units", "GET");
    if (!res) return [];
    return res;
}

export const getSampleRate = async (sessionId: number, deviceId: string) => {
    return apiRequest(`/api/devices/getSampleRate/${sessionId}/${deviceId}`, "GET");
}

export const saveSampleRate = async (sessionId: number, deviceId: string, sampleRate: number) => {
    return apiRequest("/api/devices/saveSampleRate", "PUT", {
      sessionId,
      deviceId,
      sampleRate,
    });
}

export const startBatch = async (sessionId: number) => {
    return apiRequest("/api/devices/startBatch", "PUT", {
      sessionId
    });
}

export const stopBatch = async (sessionId: number) => {
  return apiRequest("/api/devices/stopBatch", "PUT", {
    sessionId
  });
}



