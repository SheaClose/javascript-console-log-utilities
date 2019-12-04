import * as vscode from 'vscode';
export function activate(context: vscode.ExtensionContext) {
  const insertLogStatement = vscode.commands.registerCommand(
    'extension.insertLogStatement',
    executeInsertLogStatement
  );
  context.subscriptions.push(insertLogStatement);

  const deleteAllLogStatements = vscode.commands.registerCommand(
    'extension.deleteAllLogStatements',
    executeDeleteAllLogStatements
  );
  context.subscriptions.push(deleteAllLogStatements);
}

export function deactivate() {}

/* Helper Functions */
function cursorPlacement() {
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
    value: 1
  });
}

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

function insertText(
  selection: any,
  val: string,
  resolve: any = Promise.resolve
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage(
      "Can't insert log because no document is open"
    );
    return;
  }
  const range = new vscode.Range(selection.start, selection.end);

  editor
    .edit(editBuilder => {
      editBuilder.replace(range, val);
    })
    .then(() => resolve());
}

function executeInsertLogStatement() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const text = editor.selections
    .map(sel => editor.document.getText(sel))
    .filter(c => c);
  const placeholder = '';
  const emptyInsert = `console.log(${placeholder})`;
  text.length
    ? vscode.commands
        .executeCommand('editor.action.insertLineAfter')
        .then(() => {
          text.reduce((acc, _text, index) => {
            return acc.then(res => {
              return new Promise(resolve => {
                const logToInsert = `console.log('${_text}: ', ${_text})`;
                insertText(editor.selections[index], logToInsert, resolve);
              });
            });
          }, Promise.resolve());
        })
    : insertText(editor.selection, emptyInsert);
  cursorPlacement();
}

function executeDeleteAllLogStatements() {
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
