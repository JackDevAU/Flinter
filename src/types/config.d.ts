export type Config = {
  defaults: DefaultConfigSettings;
};

export type DefaultConfigSettings = {
  frontmatter: FlinterFrontmatterSettings[];
  markdownFileExtensions?: string[];
  directories?: string[];
  debug?: boolean;
};

export type FlinterCustomRuleSettings = {
  frontmatter: FlinterFrontmatterSettings[];
};

export type FlinterFrontmatterSettings = {
  field: string;
  required?: boolean;
  type?: string;
  rule?: string;
};
