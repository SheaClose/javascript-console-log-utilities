import * as vscode from 'vscode';
import { Selection, TextEditor } from 'vscode';
export function activate(context: vscode.ExtensionContext) {
  var insertLogStatement = vscode.commands.registerCommand(
    'extension.insertLogStatement',
    executeInsertLogStatement
  );
  context.subscriptions.push(insertLogStatement);

  var deleteAllLogStatements = vscode.commands.registerCommand(
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
  var logStatements = [];
  var logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
  var match;
  while ((match = logRegex.exec(documentText))) {
    var matchRange = new vscode.Range(
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
  var editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage(
      "Can't insert log because no document is open"
    );
    return;
  }
  var range = new vscode.Range(selection.start, selection.end);
  console.log('range: ', { range, val });

  editor
    .edit(editBuilder => {
      editBuilder.replace(range, val);
    })
    .then(() => resolve());
}

function executeInsertLogStatement() {
  if (vscode && vscode.window && vscode.window.activeTextEditor) {
    var editor = vscode.window.activeTextEditor;
  } else {
    return;
  }
  var text = editor.selections
    .map(sel => editor.document.getText(sel))
    .filter(c => c);
  var placeholder = '';
  var emptyInsert = `console.log(${placeholder})`;
  if (isDirectedLogger(editor)) {
    var text_to_insert = editor.document.getText(editor.selection);
    var log_to_insert = `console.log('${text_to_insert}: ', ${text_to_insert})`;
    insertText(editor.selections[1], log_to_insert);
    return;
  } else if (text.length) {
    vscode.commands.executeCommand('editor.action.insertLineAfter').then(() => {
      text.reduce((acc, _text, index) => {
        return acc.then(res => {
          return new Promise(resolve => {
            var logToInsert = `console.log('${_text}: ', ${_text})`;
            insertText(editor.selections[index], logToInsert, resolve);
          });
        });
      }, Promise.resolve());
    });
  } else {
    editor.selections.reduce((acc, cur, index) => {
      return acc.then(res => {
        return new Promise(resolve => {
          insertText(cur, emptyInsert, resolve);
        });
      });
    }, Promise.resolve());
  }
  cursorPlacement();
}

function executeDeleteAllLogStatements() {
  var editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  var document = editor.document;
  var documentText = editor.document.getText();

  var workspaceEdit = new vscode.WorkspaceEdit();

  var logStatements = getAllLogStatements(document, documentText);

  deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
}

/** In the case of a selected text and a secondary placed cursor, log to secondary location.
 * isDirectedLogger(){} determines if selected text and empty cursor
 */
function isDirectedLogger({ selections }: TextEditor): boolean {
  var selectionTypes = selections.map(
    ({
      start: { line: start_line, character: start_character },
      end: { line: end_line, character: end_character }
    }) => {
      var isEmpty = start_line + start_character === end_line + end_character;
      return isEmpty;
    }
  );
  var allSelectionsMatch = selectionTypes.every((c, i, a) => c === a[0]);
  return !allSelectionsMatch;
}
