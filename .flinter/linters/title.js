/**
 * @param {{field: string, value?: string}} params
 * @returns {{result: boolean, error?: string}}
 */
export async function run(params) {
  if (!params.value) {
    return {
      result: false,
      error: "Title is required",
    };
  }

  if (params.value ) {
    
  }

  return {
    result: true,
  };
}
