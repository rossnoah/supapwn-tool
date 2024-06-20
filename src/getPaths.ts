export async function getPaths(url: string, key: string): Promise<string[]> {
  const tables: string[] = [];
  try {
    const response = await fetch(`${url}/rest/v1/?apikey=${key}`);
    const data = await response.json();
    console.log(data);
    for (const key in data.definitions) {
      tables.push(key);
    }
    console.log(tables);
  } catch (err: any) {
    console.log(err);
  }
  if (tables.length === 0) {
    console.log("No tables found");
  }
  return tables;
}
