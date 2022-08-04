export const id = 996;
export const ids = [996];
export const modules = {

/***/ 996:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "run": () => (/* binding */ run)
/* harmony export */ });
// This must return a boolean value.

/**
 * @param {{field: string, value?: any}} params
 * @returns {{result: boolean, error?: string}}
 */
async function run(params) {
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


/***/ })

};
