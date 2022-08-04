import {
  IFlinterResult,
  FlinterRuleObject,
  FlinterType,
} from './types/flinter';

// TODO: Add type checking against the frontmatter type in the config
export const checkFlintType = (
  type: FlinterType,
  content: FlinterRuleObject
): IFlinterResult => {
  return {
    result: true,
    error: `Frontmatter field ${
      content.field
    } expected value of ${type} but got ${typeof content.value}`,
  };
};
