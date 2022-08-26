/**
 * @param {{field: string, value?: string}} params
 * @returns {{result: boolean, error?: string}}
 */
export async function run(params) {
  var uriRegex = new RegExp('(?:($.*):)');
  if (!uriRegex.test(params.value)) {
    return {
      result: false,
      error: 'Uri must be kebab case',
    };
  }

  return {
    result: true,
  };
}
