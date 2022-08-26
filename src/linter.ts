import { notice, setFailed } from '@actions/core';
import * as matter from 'gray-matter';
import { DEBUG } from '.';
import { Config, FlinterCustomRuleSettings } from './types/config';
import { IFlinter, IFlinterProps, IFlinterResult } from './types/flinter';

// TODO: Clean this step up...
const lintFrontmatter = async ({
  markdown,
  config,
  fileName,
}: IFlinterProps): Promise<IFlinterResult[]> => {
  const output: IFlinterResult[] = [];
  try {
    const frontmatter = matter(markdown).data;

    if (frontmatter) {
      for (const field in frontmatter) {
        if (DEBUG) {
          notice(`Flinting frontmatter ${field} in ${fileName}`);
        }
        if (config.defaults.directories) {
          const res = await flintCustom(
            markdown,
            config,
            config.defaults.directories,
            field,
            fileName,
            frontmatter,
          );

          if (res) {
            output.push(...res);
          }
        } else {
          const res = await flintDefault(
            markdown,
            config,
            field,
            fileName,
            frontmatter
          );
          if (res) {
            output.push(...res);
          }
        }
      }
    }
  } catch (e) {
    if (DEBUG) {
      console.log(e);
    }
  }

  return output;
};

async function flintCustom(
  markdown: string,
  config: Config,
  directories: string[],
  field: string,
  fileName: string,
  frontmatter: { [key: string]: any }
): Promise<IFlinterResult[] | undefined> {
  for (const dir of directories) {
    try {
      if (DEBUG) {
        console.log(`Checking ${dir}/${field}`);
      }

      const ruleSetting = config[
        dir as keyof Config
      ] as FlinterCustomRuleSettings;

      const currentRule = ruleSetting.frontmatter.find(f => f.field == field) ?? ruleSetting.frontmatter[0];

      return await flint({
        markdown,
        config,
        content: { field, value: frontmatter[field] },
        rule: currentRule,
        fileName,
      });
    } catch (err) {
      if (DEBUG) {
        setFailed(`Missing directory: ${field}`);
      }
    }
  }
}

async function flintDefault(
  markdown: string,
  config: Config,
  field: string,
  fileName: string,
  frontmatter: { [key: string]: any }
): Promise<IFlinterResult[] | undefined> {
  for await (const rule of config.defaults.frontmatter) {
    return await flint({
      markdown,
      config,
      content: { field, value: frontmatter[field] },
      rule,
      fileName,
    });
  }
}

const flint = async (props: IFlinter): Promise<IFlinterResult[]> => {
  const { markdown, content } = props;
  const { field } = content;
  const result: IFlinterResult[] = [];

  var index = markdown.indexOf(field);
  var tempString = markdown.substring(0, index);
  var lineNumber = tempString.split('\n').length;

  // Check if the frontmatter is valid
  const fieldResult = flintField(props);
  fieldResult.fileName = props.fileName;
  fieldResult.errorLineNo = lineNumber;
  fieldResult.field = field;
  result.push(fieldResult);

  // Check if the frontmatter value is of the correct type
  const typeResult = flintType(props);
  typeResult.fileName = props.fileName;
  typeResult.errorLineNo = lineNumber;
  typeResult.field = field;
  result.push(typeResult);

  // Runs a custom rule on the frontmatter
  const customRule = await flintRule(props);
  customRule.fileName = props.fileName;
  customRule.errorLineNo = lineNumber;
  customRule.field = field;
  result.push(customRule);

  return result;
};

// Checks if the frontmatter contains the required field
const flintField = (props: IFlinter): IFlinterResult => {
  const { content, rule } = props;
  const { field } = content;
  const { required } = rule;

  if (DEBUG) {
    console.log(`Checking if ${field} is required`);
  }

  if (required && !content.value) {
    return {
      result: false,
      error: `Missing required frontmatter field: ${field}`,
    };
  }

  return {
    result: true,
  };
};

// TODO: Implement this
// Checks if the frontmatter value is of the correct type
const flintType = (props: IFlinter): IFlinterResult => {
  const { content, rule } = props;
  const { type } = rule;

  if (DEBUG) {
    console.log(`Checking if ${content.field} is of type ${type}`);
  }

  return {
    result: true,
  };
};

// Runs a custom rule on the frontmatter
const flintRule = async (props: IFlinter): Promise<IFlinterResult> => {
  const { content, rule } = props;
  const { rule: ruleName } = rule;

  if (DEBUG) {
    console.log(`Running custom rule ${ruleName}`);
  }

  if (ruleName) {
    const { run } = await import(`../.flinter/linters/${ruleName}`);

    const { result, error }: IFlinterResult = await run(content);
    return {
      result,
      error,
    };
  }
  return {
    result: true,
  };
};

export default lintFrontmatter;
