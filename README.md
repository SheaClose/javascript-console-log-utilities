# javascript-console-log-utilities

This is an extension of the vscode-js-console-utils by [@whtouche](https://twitter.com/whtouche)
For the original extension go to the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=whtouche.vscode-js-console-utils)

# Installing

This extension is available for free in the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sheaclose.javascript-console-log-utilities)

# Usage

## With selection:

![](./src/assets/basic-log.gif)

- Highlight a variable (or really any text)
- Press Cmd+Shift+L
- The output (on a new line) will be: console.log('variable: ', variable);

## With multiple selections:

![](./src/assets/multiple-logs.gif)

- Highlight multiple variables
- Press Cmd+Shift+L
- The output (below each selection) will be: console.log('variable: ', variable);

## With selection and secondary cursor:

![](./src/assets/Secondary-location-log.gif)

- Highlight variable and a destination (via ctrl + click)
- Press Cmd+Shift+L
- The output will be placed at the secondary location.

## Without selection:

![](./src/assets/empty-console-log.gif)

- Press Cmd+Shift+L
- The output (on the same line) will be: console.log();

## To remove console.logs:

![](./src/assets/Delete-all-logs.gif)

- Press Cmd+Shift+D
- This will delete all console.log statements in the current document

# License

[MIT License](https://github.com/whtouche/vscode-js-console-utils/blob/master/LICENSE)
