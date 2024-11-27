import * as vscode from 'vscode';
import { exec } from 'child_process';

function countErrors() {
	// Count "problems in this file" in all source code files
	let errorCount = 0;
	const allowedFiles = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'c', 'cpp', 'h', 'hpp', 'java', 'py', 'rb', 'php', 'go', 'swift', 'kt', 'rs', 'sh', 'md', 'yml', 'yaml', 'xml', 'sql', 'pl', 'cs', 'vb', 'fs', 'fsx', 'fsi', 'lua', 'r', 'scala', 'groovy', 'gradle', 'bat', 'cmd', 'ps1', 'psm1', 'psd1', 'ps1xml', 'psc1', 'psc2', 'd', 'dart', 'erl', 'ex', 'exs', 'elm'];

	// Get all diagnostics
	const diagnostics = vscode.languages.getDiagnostics();

	// Iterate over all diagnostics
	diagnostics.forEach(([uri, diagnostic]) => {
		const ext = uri.path.split('.').pop()?.toLowerCase();
		if (ext && allowedFiles.includes(ext)) {
			// Count only errors and warnings
			errorCount += diagnostic.filter(d => d.severity === vscode.DiagnosticSeverity.Error || d.severity === vscode.DiagnosticSeverity.Warning).length;
		}
	});

	return errorCount;
}
var statusBarItem: vscode.StatusBarItem | null = null;


const grace_period = 5;
var time = grace_period;

const SUPER_BAD_IDEA_ONLY_ACTIVATE_IF_YOU_WANT_ETERNAL_PAIN_AND_SUFFERING = true;

function loop() {
	const errors = countErrors();
	console.log('Errors:', errors, process.platform);
	if (statusBarItem !== null) {
		// Add fire emoji if there are more than 3 errors
		const emoji = errors > 5 ? '🔥' : errors > 3 ? '⚠️' : '';
		statusBarItem.text = "Errors: " + emoji + errors.toString() + emoji;
		statusBarItem.color = errors > 0 ? (errors > 3 ? 'red' : 'yellow') : 'white';
		statusBarItem.backgroundColor = errors > 3 ? new vscode.ThemeColor('statusBarItem.errorBackground') : undefined;

		if (errors > 5) {
			time--;
			vscode.window.showErrorMessage(`Too many errors! Shutting down in ${time} seconds...`);

			if (time <= 0) {
				console.log('Shutting down...');
				if (!SUPER_BAD_IDEA_ONLY_ACTIVATE_IF_YOU_WANT_ETERNAL_PAIN_AND_SUFFERING) {
					vscode.commands.executeCommand('workbench.action.closeWindow');
					return;
				}

				switch (process.platform) {
					case "win32":
						exec('shutdown /s /c "Damn this code sucks" /t 5 /d u:4:6');
						break;
					case "linux":
						exec('shutdown');
						break;
					default:
						exec('shutdown');
						break;
				}
			}
		}
		else {
			time = grace_period;
		}
	}
	setTimeout(loop, 1000);
}

export function activate(context: vscode.ExtensionContext) {
	// This code will run immediately when the extension is activated
	console.log('Congratulations, your extension "vscode-error" is now active!');

	// Display a message box to the user immediately upon activation
	vscode.window.showInformationMessage('Error counter active!');

	// Add status bar item
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = 'Errors: 0';
	statusBarItem.show();

	loop();
}

export function deactivate() { }