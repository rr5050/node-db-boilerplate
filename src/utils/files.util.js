'use strict'
import fs from 'fs'
import { arrayOfObjectsToOneObject } from '../utils/misc.utils.js'

// ****** Async read all files in a folder
// param: path
// output: one ojbect with all files in the folder (name & content)
// output key = 'filename', value = 'content'
export const readFiles = async (dirname) => {
	const readDirPr = new Promise((resolve, reject) => {
		fs.readdir(dirname, (err, filenames) => (err ? reject(err) : resolve(filenames)))
	})

	const allFileContents = await readDirPr.then((filenames) =>
		Promise.all(
			filenames.map((filename) => {
				return new Promise((resolve, reject) => {
					fs.readFile(dirname + filename, 'utf-8', (err, content) =>
						err ? reject(err) : resolve({ filename, content })
					)
				})
			})
		).catch((error) => Promise.reject(error))
	)
	return arrayOfObjectsToOneObject(allFileContents, 'filename', 'content')
}
