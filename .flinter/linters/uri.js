/**
 * @param {{field: string, value?: string}} params
 * @returns {{result: boolean, error?: string}}
 */
export async function run(params) {
  console.log('TEST CUSTOM RULE');
  if (!params.value) {
    return {
      result: false,
      error: 'Uri is required',
    };
  }

  var uriRegex = new RegExp('(?:($.*):)');
  console.log(uriRegex.test(params.value));
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
