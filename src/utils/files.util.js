'use strict'
import fs from 'fs'

// converts an array of Objects into one Object
// Example:
//   Input:  [ { key: '11', value: '1100' }, { key: '22', value: '2200' } ]
//   Output: { "11": "1100", "22": "2200" }
export const arrayOfObjectsToOneObject = (arrayOfObjects, key, value) => {
	return arrayOfObjects.reduce((obj, item) => ((obj[item[key]] = item[value]), obj), {})
}

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
