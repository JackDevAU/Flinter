// This must return a boolean value.

/**
 * @param {{field: string, value?: any}} params
 * @returns {{result: boolean, error?: string}}
 */
export async function run(params) {
  const { field, value } = params;
  let output = '';

  if (value) {
    for (const { name, url } of value) {
      console.log(name);
      console.log(url);
      output += `${name} ${url} `;
    }
  }
  return {
    result: false,
    error: `Field ${field} - ${output}`,
  };
}
