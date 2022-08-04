// This must return a boolean value.

/**
 * @param {{field: string, value?: string}} params
 * @returns {{result: boolean, error?: string}}
 */
export async function run(params) {
  return params.value
    ? {
        result: true,
      }
    : {
        result: false,
        error: `${params.field} is required.`,
      };
}
