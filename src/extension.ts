import { relative } from 'path'
import * as vscode from 'vscode'
const fs = require('fs')
const ini = require('ini')
const gh = require('parse-github-url')

interface GetGithubLineInput {
	currentFile: string | undefined;
	dotGitFolderPath: string | undefined;
	currentLine: number | undefined;
}

interface RepoInfo {
	href: string;
	host: string;
	branch: string;
	owner: string;
	repo: string;
	name: string;
}

export function activate(context: vscode.ExtensionContext) {
	const getCurrentFile = (dotGitFolderPath?: string): string | undefined => {
		// get the current file the user has currently opened and is viewing
		let currFile = vscode.window.activeTextEditor?.document.fileName.toString()
		
		
		// get name of repo
		const config = ini.parse(fs.readFileSync(dotGitFolderPath + '/config', 'utf8'))
		// call getRepoUrl and get structured data
		// format url with slashes 
		const repoInfo = getRepoInfo(dotGitFolderPath)
		const repoName = repoInfo.name
		let currFileSplits = currFile?.split('/')

		// split on '/' 
		let repoNameIdx = 0
		currFileSplits?.forEach((folder, idx) => {
			console.log(folder, repoName, idx)
			if(folder === repoName) {
				repoNameIdx = idx
				return
			}
		})

		// remove all items before the element, inclusive
		currFileSplits = currFileSplits?.slice(repoNameIdx+1, currFileSplits?.length)
		// combine the remaining with a '/'
		return currFileSplits?.join('/')
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
		const line = vscode.window.activeTextEditor?.selection.active.line
		if(line){
			return line + 1
		}

		return undefined
	}

	const getCurrentCommit = (dotGitFolderPath?: string): string | undefined => {
		// get file path HEAD referencing
		const headData = fs.readFileSync(dotGitFolderPath + '/HEAD', 'utf8')
		// read file path
		const commitshaFilepath = headData.split(": ")[1].trim()
		const commitshaData = fs.readFileSync(dotGitFolderPath + '/' + commitshaFilepath, 'utf8')
		return commitshaData.trim()
	}

	const getCurrentBranch = (dotGitFolderPath?: string): string | undefined => {
		// read branch in HEAD
		const headData = fs.readFileSync(dotGitFolderPath + '/HEAD', 'utf8')
		// read file path
		const commitshaFilepath = headData.split(": ")[1].trim()		
		const slashSplits: string[] = commitshaFilepath.split("/")
		return slashSplits[slashSplits.length-1]
	}

	const getRepoInfo = (dotGitFolderPath?: string): RepoInfo => {
		const config = ini.parse(fs.readFileSync(dotGitFolderPath + '/config', 'utf8'))	
		return gh(config['remote "origin"'].url)
	}

	const generateGithubLink = (file: string, commitSha: string, repoInfo: RepoInfo, line: number): string => {
		// format https link for repoUrl here
		return `https://${repoInfo.host}/${repoInfo.repo}/blob/${commitSha}/${file}#L${line}`
	}

	const getGithubLink = (): string | undefined => {
		const dotGitFolderPath = getDotGitFolderPath()
		const inputs: GetGithubLineInput = {
			currentFile: getCurrentFile(dotGitFolderPath),
			dotGitFolderPath: dotGitFolderPath,
			currentLine: getCurrentLine()
		}

		const commit = getCurrentCommit(inputs.dotGitFolderPath)
		const repoInfo = getRepoInfo(inputs.dotGitFolderPath)
		if(inputs.currentFile && commit && repoInfo && inputs.currentLine) {
			return generateGithubLink(inputs.currentFile, commit, repoInfo, inputs.currentLine)
		} else {
			return undefined
		}
	}


	const getGithubLine = vscode.commands.registerCommand('goto-line-link.getGithubLine', () => {
		const githubLink = getGithubLink()

		if(githubLink){
			vscode.env.clipboard.writeText(githubLink)
			vscode.window.showInformationMessage('Link to line copied to clipboard!')
		} else {
			vscode.window.showInformationMessage("Something went wrong")
		}
	});

	const gotoGithubLine = vscode.commands.registerCommand('goto-line-link.gotoGithubLine', () => {
		const githubLink = getGithubLink()

		if(githubLink){
			vscode.env.openExternal(vscode.Uri.parse(githubLink))
		} else {
			vscode.window.showInformationMessage("Something went wrong")
		}
	});	

	context.subscriptions.push(getGithubLine)
	context.subscriptions.push(gotoGithubLine)
}

// this method is called when your extension is deactivated
export function deactivate() {}
