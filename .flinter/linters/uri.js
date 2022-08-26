/**
 * @param {{field: string, value?: string}} params
 * @returns {{result: boolean, error?: string}}
 */
export async function run(params) {
  var uriRegex = new RegExp('/^(?![0-9]+$)(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$/g');
  console.log('Params for custom scan');
  console.log(params);

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
