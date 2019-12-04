// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const insertText = (val: any) => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage(
      "Can't insert log because no document is open"
    );
    return;
  }

  const selection = editor.selection;

  const range = new vscode.Range(selection.start, selection.end);

  editor.edit(editBuilder => {
    editBuilder.replace(range, val);
  });
};

function getAllLogStatements(document: any, documentText: any) {
  let logStatements = [];

  const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
  let match;
  while ((match = logRegex.exec(documentText))) {
    let matchRange = new vscode.Range(
      document.positionAt(match.index),
      document.positionAt(match.index + match[0].length)
    );
    if (!matchRange.isEmpty) {
      logStatements.push(matchRange);
    }
  }
  return logStatements;
}

function deleteFoundLogStatements(workspaceEdit: any, docUri: any, logs: any) {
  logs.forEach((log: any) => {
    workspaceEdit.delete(docUri, log);
  });

  vscode.workspace.applyEdit(workspaceEdit).then(() => {
    logs.length > 1
      ? vscode.window.showInformationMessage(
          `${logs.length} console.logs deleted`
        )
      : vscode.window.showInformationMessage(
          `${logs.length} console.log deleted`
        );
  });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('console-log-utils is now active');
  debugger;
  const insertLogStatement = vscode.commands.registerCommand(
    'extension.insertLogStatement',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      debugger;
      const selection = editor.selection;
      const text = editor.document.getText(selection);
      const placeholder = '';
      const emptyInsert = `console.log(${placeholder})`;
      const cursorPlacement = () => {
        // release the selection caused by inserting
        vscode.commands.executeCommand('cursorMove', {
          to: 'right',
          by: 'character',
          value: 1
        });
        // position the cursor inside the parenthesis
        vscode.commands.executeCommand('cursorMove', {
          to: 'left',
          by: 'character',
          value: 2
        });
      };
      text
        ? vscode.commands
            .executeCommand('editor.action.insertLineAfter')
            .then(() => {
              const logToInsert = `console.log('${text}: ', ${text})`;
              insertText(logToInsert);
            })
        : insertText(emptyInsert);
      cursorPlacement();
    }
  );
  context.subscriptions.push(insertLogStatement);

  const deleteAllLogStatements = vscode.commands.registerCommand(
    'extension.deleteAllLogStatements',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      const documentText = editor.document.getText();

      let workspaceEdit = new vscode.WorkspaceEdit();

      const logStatements = getAllLogStatements(document, documentText);

      deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
    }
  );
  context.subscriptions.push(deleteAllLogStatements);
}

// this method is called when your extension is deactivated
export function deactivate() {}
