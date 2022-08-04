// MIT License

// Copyright (c) 2021 Tim Hagn

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { Endpoints } from '@octokit/types';
import { GitHub } from '@actions/github/lib/utils';
import { setFailed, notice, warning, info } from '@actions/core';
import { context } from '@actions/github';
import initOctokit from './helpers';
import { DEBUG } from '.';

export interface IChangedFilesProps {
  reporter: InstanceType<typeof GitHub> | undefined;
  repoToken: string;
}

export type IChangedFiles = {
  allFormattedFiles: string;
  addedFormatted: string;
  modifiedFormatted: string;
  removedFormatted: string;
  renamedFormatted: string;
  addedModifiedFormatted: string;
  allFiles?: Endpoints['GET /repos/{owner}/{repo}/compare/{basehead}']['response']['data']['files'];
};

/**
 * Returns a list of changed files.
 */
const getChangedFiles = async ({
  reporter,
  repoToken,
}: IChangedFilesProps): Promise<IChangedFiles | undefined> => {
  try {
    // Do we have an existing reporter?
    let octokit;
    if (!reporter) {
      octokit = initOctokit({ token: repoToken });
    } else {
      octokit = reporter;
    }
    const { eventName } = context;

    // Define the base and head commits to be extracted from the payload.
    let base;
    let head;

    switch (eventName) {
      case 'pull_request':
      case 'pull_request_target':
        base = context?.payload?.pull_request?.base.sha;
        head = context?.payload?.pull_request?.head.sha;
        break;
      case 'push':
        base = context.payload.before;
        head = context.payload.after;
        break;
      default:
        setFailed(
          `This action only supports pull requests and pushes, ${context.eventName} events are not supported. ` +
            "Please submit an issue on this action's GitHub repo if you believe this in correct."
        );
    }

    // Ensure that the base and head properties are set on the payload.
    if (!base || !head) {
      warning(
        `The base or head commits are missing from the payload for this ${context.eventName} event. ` +
          "Please submit an issue on this action's GitHub repo."
      );

      base = '';
      head = '';
    }

    const basehead = `${base}...${head}`;

    // Use GitHub's compare two commits API.
    // https://developer.github.com/v3/repos/commits/#compare-two-commits
    const response = await octokit.rest.repos.compareCommitsWithBasehead({
      owner: context.repo.owner,
      repo: context.repo.repo,
      basehead,
    });

    // Ensure that the request was successful.
    if (response.status !== 200) {
      warning(
        `The GitHub API for comparing the base and head commits for this ${context.eventName} event returned ${response.status}, expected 200. ` +
          "Please submit an issue on this action's GitHub repo."
      );
    }

    // Ensure that the head commit is ahead of the base commit.
    if (response.data.status !== 'ahead') {
      warning(
        `The head commit for this ${context.eventName} event is not ahead of the base commit. ` +
          "Please submit an issue on this action's GitHub repo."
      );
    }

    const { files } = response.data;

    if (!files) {
      warning(
        `The GitHub API for comparing the base and head commits for this ${context.eventName} event returned no files. `
      );
      return undefined;
    }

    const all = [];
    const added = [];
    const modified = [];
    const removed = [];
    const renamed = [];
    const addedModified = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
      const { filename } = file;
      // Prevent accidentally adding files from history folder.
      if (filename.includes('.history')) {
        // eslint-disable-next-line no-continue
        continue;
      }

      all.push(filename);
      switch (file.status) {
        case 'added':
          added.push(filename);
          addedModified.push(filename);
          break;
        case 'modified':
          modified.push(filename);
          addedModified.push(filename);
          break;
        case 'removed':
          removed.push(filename);
          break;
        case 'renamed':
          renamed.push(filename);
          break;
        default:
          setFailed(
            `One of your files includes an unsupported file status '${file.status}', expected 'added', 'modified', 'removed', or 'renamed'.`
          );
      }
    }

    const allFormatted = all.join(',');
    const addedFormatted = added.join(',');
    const modifiedFormatted = modified.join(',');
    const removedFormatted = removed.join(',');
    const renamedFormatted = renamed.join(',');
    const addedModifiedFormatted = addedModified.join(',');
    const allFiles = files;

    // Log the output values.
    if (DEBUG) {
      info(`All: ${allFormatted}`);
      info(`Added: ${addedFormatted}`);
      info(`Modified: ${modifiedFormatted}`);
      info(`Removed: ${removedFormatted}`);
      info(`Renamed: ${renamedFormatted}`);
      info(`Added or modified: ${addedModifiedFormatted}`);
    }

    return {
      allFormattedFiles: allFormatted,
      addedFormatted,
      modifiedFormatted,
      removedFormatted,
      renamedFormatted,
      addedModifiedFormatted,
      allFiles,
    };
  } catch (err) {
    if (err instanceof Error) {
      notice(err.message);
    }
  }
};

export default getChangedFiles;
