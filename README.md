# A GitHub Repo template

A barebones template for any repository!

Provides: labels, GitHub Issue templates and Document templates for all your future needs!

Don't forget to add a **.gitignore** and a **License**!!

## Setup (Optional) - Add labels

### Prerequisites

This step requires: [Labeler](https://github.com/Zebiano/Labeler)

Install it with:

    npm install --global labeler

Then run to find the file location:

    labeler -p

Replace the `labeler_labels.json` at that location with our copy in `./github/LABEL_TEMPLATE/labeler_labels.json`

You'll need your Github Personal Access Token for the next step which can be found [here](https://github.com/settings/tokens)

Then run the command:

    labeler -t [GITHUB_PERSONAL_ACCESS_TOKEN] -o [USER/ORGANISATION] -r [REPOSITORY_NAME] -duf
