import { Config, FlinterFrontmatterSettings } from './config';

export type FlinterText = string;
export type FlinterNumber = number;
export type FlinterBoolean = boolean;
export type FlinterArray = any[];
export type FlinterObject = Record<string, any>;

export type FlinterType =
  | FlinterText
  | FlinterNumber
  | FlinterBoolean
  | FlinterArray
  | FlinterObject;

export interface IFlinterProps {
  markdown: string;
  config: Config;
  fileName: string;
}

export interface IFlinterResult {
  result: boolean;
  error?: string;
  errorLineNo?: number;
  field?: string;
  fileName?: string;
}

export interface IFlinter {
  markdown: string;
  config: Config;
  fileName: string;
  content: FlinterRuleObject;
  rule: FlinterFrontmatterSettings;
}

export type FlinterRuleObject = {
  field: string;
  value: any;
};

interface IFlintResults {
  results: IFlinterResult[];
}
