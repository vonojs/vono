import api from "#server/api"

const r = await api.ping.$get().then(r => r.json())

export const dyn = "dynamically imported"