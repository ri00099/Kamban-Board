
import client from "./client";

export const fetchWorkspaces = () =>
  client.get("/workspaces").then((r) => r.data);

export const createWorkspace = (payload) =>
  client.post("/workspaces", payload).then((r) => r.data);

export const inviteMember = (workspaceId, email, role = "editor") =>
  client.post(`/workspaces/${workspaceId}/invite`, { email, role }).then((r) => r.data);

export const fetchBoardActivity = (boardId, page = 1, limit = 20) =>
  client
    .get(`/boards/${boardId}/activity`, { params: { page, limit } })
    .then((r) => r.data);