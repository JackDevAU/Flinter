/**
 * @param {{field: string, value?: string}} params
 * @returns {{result: boolean, error?: string}}
 */
export async function run(params) {
  var uriRegex = new RegExp('^(?![0-9]+$)(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$');

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
