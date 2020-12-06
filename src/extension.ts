import { relative } from 'path'
import * as vscode from 'vscode'
const fs = require('fs')

interface GetGithubLineInput {
	currentFile: string | undefined;
	dotGitFolderPath: string | undefined;
	currentLine: number | undefined;
}

export function activate(context: vscode.ExtensionContext) {
	const getCurrentFile = (): string | undefined => {
		// get the current file the user has currently opened and is viewing
		return vscode.window.activeTextEditor?.document.fileName.toString()
	}

	const getDotGitFolderPath = (): string | undefined => {
		let relativePath: string | undefined = vscode.window.activeTextEditor?.document.uri.path
		let foundDotGitFolder: boolean = false

		while( (relativePath && relativePath?.length > 0) && !foundDotGitFolder) {
			// start from end of string and move backwards
			let char = relativePath[relativePath.length - 1]
			// once there is a slash, stop and check for a .git folder in that path
			if(char === "/") {
				const files: string[] = fs.readdirSync(relativePath)
				files.forEach((file: string) => {
					if(file === ".git") {
						foundDotGitFolder = true
						return
					}
				})				
			}

			if(!foundDotGitFolder) {
				// do so until you've hit the index 0 and return undefined if nothing is found
				relativePath = relativePath.slice(0, relativePath.length - 1)
			}
		}

		return relativePath + ".git"
	}

	const getCurrentLine = (): number | undefined => { 
		return vscode.window.activeTextEditor?.selection.active.line
	}

	const getCurrentCommit = (dotGitFolderPath?: string): string | undefined => {
		// get file path HEAD referencing
		const headData = fs.readFileSync(dotGitFolderPath + '/HEAD', 'utf8')
		// read file path
		console.log('headdata', headData)
		const commitshaFilepath = headData.split(": ")[1]
		console.log('commitsha filepath', dotGitFolderPath + '/' + commitshaFilepath)
		const commitshaData = fs.readFilesync(dotGitFolderPath + '/' + commitshaFilepath, 'utf8')
		console.log('commitsha', commitshaData)
		return commitshaData
	}

	const getCurrentBranch = (dotGitFolderPath?: string): string | undefined => {
		// read branch in HEAD
		return undefined
	}

	const getRepoUrl = (dotGitFolderPath?: string): string | undefined => {
		// read branch 
		return undefined
	}

	const generateGithubLink = (file: string, commitSha: string, branch: string, repoUrl: string): string => {
		// read 
		return ''
	}


	let disposable = vscode.commands.registerCommand('one-line.getGithubLine', () => {
		const inputs: GetGithubLineInput = {
			currentFile: getCurrentFile(),
			dotGitFolderPath: getDotGitFolderPath(),
			currentLine: getCurrentLine()
		}

		console.log(inputs)

		const commit = getCurrentCommit(inputs.dotGitFolderPath)
		const branch = getCurrentBranch(inputs.dotGitFolderPath)
		const repoUrl = getRepoUrl(inputs.dotGitFolderPath)

		console.log(inputs.currentFile, commit, branch, repoUrl)


		if(inputs.currentFile && commit && branch && repoUrl) {
			vscode.window.showInformationMessage(generateGithubLink(inputs.currentFile, commit, branch, repoUrl))
		} else {
			vscode.window.showInformationMessage("Something went wrong")
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
