export const ping = async () => {
  console.log("ping")
  return { pong: true }
}

export const stats = async () => {
  console.log("stats")
  return { stats: "foo" }
}
