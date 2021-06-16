import * as vscode from 'vscode';
import { Selection, TextEditorEdit } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.convertInputToGetSet', () => {
      const activeTextEditor = vscode.window?.activeTextEditor;
      if (!activeTextEditor) {
        return;
      }
      const [text, type = '$1', ...rest] = activeTextEditor.selections.map((sel: Selection) =>
        activeTextEditor.document.getText(sel)
      );
      const lineRange = activeTextEditor.document.lineAt(activeTextEditor.selection.anchor)?.range;
      const textToInsert = setText(text, type);
      if (rest?.length) return;
      if (!text) return;
      const range = new vscode.Range(lineRange.start, lineRange.end);
      return activeTextEditor.edit((editBuilder: TextEditorEdit) => {
        editBuilder.replace(range, textToInsert);
      });
    })
  );
}

export function deactivate() {}

function setText(text: string, type: string) {
  return `_${text}: ${type};
  @Input() set ${text}( _${text}: ${type}) {
    console.log("_${text}: ", _${text});
    this._${text} = _${text}
  }
  get ${text}() {
    return this._${text};
  }`;
}
