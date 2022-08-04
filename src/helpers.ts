import { GitHub, getOctokitOptions } from '@actions/github/lib/utils';
import { getOctokit } from '@actions/github';
import { DEBUG } from '.';

interface IOctokitProps {
  token: string;
}

const initOctokit = ({ token }: IOctokitProps): InstanceType<typeof GitHub> => {
  const opts: ReturnType<typeof getOctokitOptions> = {};

  if (DEBUG) opts.log = console;

  return getOctokit(token, opts);
};

export default initOctokit;
