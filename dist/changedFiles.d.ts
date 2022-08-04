import { Endpoints } from '@octokit/types';
import { GitHub } from '@actions/github/lib/utils';
interface IChangedFilesProps {
    reporter: InstanceType<typeof GitHub> | undefined;
    repoToken: string;
    debug: boolean;
}
declare type IChangedFiles = {
    allFormattedFiles: string;
    addedFormatted: string;
    modifiedFormatted: string;
    removedFormatted: string;
    renamedFormatted: string;
    addedModifiedFormatted: string;
    allFiles?: Endpoints['GET /repos/{owner}/{repo}/compare/{basehead}']['response']['data']['files'];
};
declare const getChangedFiles: ({ reporter, repoToken, debug, }: IChangedFilesProps) => Promise<IChangedFiles | undefined>;
export default getChangedFiles;
