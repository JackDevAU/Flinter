import { setFailed, notice, getInput, getMultilineInput, summary } from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import {
  DEFAULT_VALID_IMAGE_EXTENSIONS,
  DEFAULT_VALID_MARKDOWN_EXTENSIONS,
} from './constants';

import getChangedFiles, { IChangedFiles } from './changedFiles';
import initOctokit from './helpers';
import lintFrontmatter from './linter';
import { Config } from './types/config';
import { IFlinterResult, IFlintResults } from './types/flinter';

const handleError = (error: Error) => {
  console.error(error);
  setFailed(`Unhandled error: ${error}`);
};

export const DEBUG = getInput('DEBUG') === 'true';

// TODO: Tidy this up!
async function run() {
  //                              .-----.
  //                             /7  .  (
  //                            /   .-.  \
  //                           /   /   \  \
  //                          / `  )   (   )
  //                         / `   )   ).  \
  //                       .'  _.   \_/  . |
  //      .--.           .' _.' )`.        |
  //     (    `---...._.'   `---.'_)    ..  \
  //      \            `----....___    `. \  |
  //       `.           _ ----- _   `._  )/  |
  //         `.       /"  \   /"  \`.  `._   |
  //           `.    ((O)` ) ((O)` ) `.   `._\
  //             `-- '`---'   `---' )  `.    `-.
  //                /                  ` \      `-.
  //              .'                      `.       `.
  //             /                     `  ` `.       `-.
  //      .--.   \ ===._____.======. `    `   `. .___.--`     .''''.
  //     ' .` `-. `.                )`. `   ` ` \          .' . '  8)
  //    (8  .  ` `-.`.               ( .  ` `  .`\      .'  '    ' /
  //     \  `. `    `-.               ) ` .   ` ` \  .'   ' .  '  /
  //      \ ` `.  ` . \`.    .--.     |  ` ) `   .``/   '  // .  /
  //       `.  ``. .   \ \   .-- `.  (  ` /_   ` . / ' .  '/   .'
  //         `. ` \  `  \ \  '-.   `-'  .'  `-.  `   .  .'/  .'
  //           \ `.`.  ` \ \    ) /`._.`       `.  ` .  .'  /
  //     LGB    |  `.`. . \ \  (.'               `.   .'  .'
  //         __/  .. \ \ ` ) \                     \.' .. \__
  //  .-._.-'     '"  ) .-'   `.                   (  '"     `-._.--.
  // (_________.-====' / .' /\_)`--..__________..-- `====-. _________)
  //                  (.'(.'

  let config: Config;
  // Get the .flinter/config.json file
  try {
    const configPath = path.join(
      process.env.GITHUB_WORKSPACE ?? `${process.cwd()}`,
      '/.flinter/config.json'
    );

    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    if (err instanceof Error) {
      handleError(err);
    }
    return;
  }

  // get inputs
  const repoToken = getInput('GITHUB_TOKEN', { required: true });

  // Get the directories array from input. The first element is the projects markdown directory and the second one is the images one.
  const directory = getInput('VALID_DIRECTORY');

  let markdownExtensions = getMultilineInput('VALID_MARKDOWN_EXTENSIONS');

  if (markdownExtensions.length < 1) {
    markdownExtensions = DEFAULT_VALID_MARKDOWN_EXTENSIONS;
  }

  const imageExtensions =
    getInput('VALID_IMAGE_EXTENSIONS') || DEFAULT_VALID_IMAGE_EXTENSIONS;

  const frontmatterFields = getMultilineInput('REQUIRED_FRONTMATTER');

  // Create a octokit reporter.
  const reporter = initOctokit({ token: repoToken });

  // get changed Files
  const changedFiles = await getChangedFiles({
    reporter,
    repoToken,
  });

  const files = await FindFiles(changedFiles, directory, markdownExtensions);
  if (!files) {
    notice(`No files found.`);
    return;
  }
  const output = await CheckMarkdownFiles(files, config);

  await PrintOutput(output);
  await PrintSummary(output);
}

process.on('unhandledRejection', handleError);
run().catch(handleError);

async function FindFiles(
  changedFiles: IChangedFiles | undefined,
  directory: string,
  markdownExtensions: string[]
) {
  const output = [];

  if (!changedFiles) {
    notice('No changed files found.');
    return;
  }

  const { allFiles } = changedFiles;

  if (!allFiles) {
    notice('No valid changed files found.');
    return;
  }

  for await (const file of allFiles) {
    const { filename } = file;
    if (filename.includes(directory)) {
      const extension = path.extname(filename);
      if (markdownExtensions.includes(extension)) {
        output.push(filename);
      }
    }
  }
  return output;
}

async function CheckMarkdownFiles(
  files: string[],
  config: Config
): Promise<IFlintResults> {
  const output: IFlintResults = {
    results: [],
  };

  for await (const fileName of files) {
    // Check files with valid markdown extensions only.
    const markdownData = fs.readFileSync(fileName, 'utf8'); // Read markdown content from the file.

    const markdownResult = await lintFrontmatter({
      markdown: markdownData,
      fileName,
      config,
    });

    for (const result of markdownResult) {
      output.results.push(result);
    }
  }
  return output;
}

async function PrintOutput(output: IFlintResults): Promise<void> {
  var errors = output.results.filter((err) => err.result == false);

  if (errors.length > 0) {
    setFailed(`errors found: ${errors.length}`);

    for (const error of errors) {
      setFailed(
        `${error.error} ${error?.fileName ? `in file ${error?.fileName}` : ''}`
      );
    }
  }
}

async function PrintSummary(output: IFlintResults): Promise<void> {
  summary.addHeading('Flint Results');

  var filesScanned: { fileName: string | undefined; success: boolean; }[] = [];

  output.results.forEach((error: IFlinterResult) => {
    var existingItemIndex = filesScanned.map(f => f.fileName).indexOf(error.fileName);

    if (existingItemIndex == -1) { // File not listed yet
      filesScanned.push({ fileName: error.fileName, success: error.result });
    } else if (!error.result) {
      filesScanned[existingItemIndex].success = false;
    }
  });

  var summaryTableArray = [];
  summaryTableArray.push([{ data: 'File Name', header: true }, { data: 'Result', header: true }]);

  filesScanned.forEach((file: { fileName: string | undefined; success: boolean; }) => {
    summaryTableArray.push([file.fileName, file.success ? '✅' : '❌']);
  });

  summary.addTable(summaryTableArray);

  var errorCount = output.results.filter((err) => err.result == false).length;
  summary.addHeading(`File Errors - ${errorCount}`, 2);

  filesScanned.filter(f => !f.success).forEach(f => {
    var tableArray = [];
    summary.addHeading(f.fileName ?? '', 3);

    tableArray.push([{ data: 'Field', header: true }, { data: 'Line Number', header: true }, { data: 'Error Message', header: true }]);

    output.results.filter(e => e.fileName == f.fileName && !e.result).forEach(err =>
      tableArray.push([err.field, err.errorLineNo?.toString(), err.error ?? ''])
    );

    summary.addTable(tableArray);
  });

  await summary.write();
}
