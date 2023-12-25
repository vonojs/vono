import * as fs from 'fs/promises';

export async function writeTypes(){
  await fs.mkdir("node_modules/.vpb", { recursive: true });
  await fs.writeFile("node_modules/.vpb/template.d.ts", `
declare module "#server/template" {
  const tmpl: string
  export default tmpl
}`.trim())
}