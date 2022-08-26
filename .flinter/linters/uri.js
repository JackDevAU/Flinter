/**
 * @param {{field: string, value?: string}} params
 * @returns {{result: boolean, error?: string}}
 */
export async function run(params) {
  var uriRegex = new RegExp('(?:($.*):)');
  console.log('Params for custom scan');
  console.log(params);

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
