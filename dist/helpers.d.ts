import { GitHub } from '@actions/github/lib/utils';
interface IOctokitProps {
    token: string;
    debug: boolean;
}
declare const initOctokit: ({ token, debug, }: IOctokitProps) => InstanceType<typeof GitHub>;
export default initOctokit;
