export const id = 613;
export const ids = [613];
export const modules = {

/***/ 4613:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "run": () => (/* binding */ run)
/* harmony export */ });
// This must return a boolean value.

/**
 * @param {{field: string, value?: string}} params
 * @returns {{result: boolean, error?: string}}
 */
async function run(params) {
  return params.value
    ? {
        result: true,
      }
    : {
        result: false,
        error: `${params.field} is required.`,
      };
}


/***/ })

};
