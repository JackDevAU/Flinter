# Flinter

## Build locally

1. Install packages

```bash
yarn install
```

2. Build with ncc

```bash
yarn build
```

Currently, as this is built using TS we need to run `yarn build` before pushing.

## Flinter Config Fields

To use this GitHub action, you'll need to create a `.flinter/config.json` file. See the below table for information.

### Defaults

Put these fields inside a `defaults` section

| Field                    | Type           | Required | Information                                                                                                                                     |
| ------------------------ | -------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `markdownFileExtensions` | Array          | ✅       | A list of markdown file extensions to lint against                                                                                              |
| `frontmatter`            | Array<Objects> | ✅       | A list of all fields to lint. If you add `directories` these fields won't be checked. See below for more information on the frontmatter object. |                                                                                                                     |
| `directories`            | Array          | ❌       | If you have a specific directories where you only want to lint against those specific markdown files.                                           |

### Frontmatter Object

| Field      | Type    | Required | Information                                        |
| ---------- | ------- | -------- | -------------------------------------------------- |
| `field`    | String  | ✅       | The name of the frontmatter field to lint          |
| `required` | Boolean | ❌       | If true, will return an error if the value is null |
| `type`     | String  | ❌       | TODO: Implement basic type checking                |
| `rule`     | String  | ❌       | name of the custom rule to run. e.g. "custom.js"   |

### Writing custom rules

To write custom rules.

1. Create a new folder `./flinter/linters/`
1. Create a `.js` file and export an async function called `run`. See the template below.
1. Return a FlinterResult [Boolean,String]
1. Add the file name to the Frontmatter field's `rule`.

```js
// This must return a boolean value.

/**
 * @param {{field: string, value?: string}} params
 * @returns {{result: boolean, error?: string}}
 */
export async function run(params) {
  return {
    result: true,
  };
}
```

### Example Config.json

```json
{
  "defaults": {
    "markdownFileExtensions": ["md", "mdx"],
    "frontmatter": [
      {
        "field": "title",
        "type": "text",
        "required": true
      }
    ]
  },
  "rules": {
    "frontmatter": [
      {
        "field": "title",
        "type": "text",
        "required": true,
        "rule": "title.js"
      },
      {
        "field": "authors",
        "type": "object",
        "rule": "authors.js"
      }
    ]
  }
}
```

> **Note**  
> To enable debug logging, set `DEBUG` to `true` where the Flinter action is used  
> e.g.

```yml
    steps:
      - name: Flinter.md
        uses: JackDevAU/Flinter@Alpha-v0.0.1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DEBUG: true
```

## Acknowledgements

This builds on from the awesome work over @ [lint-md-fm](https://github.com/timhagn/lint-md-fm).
