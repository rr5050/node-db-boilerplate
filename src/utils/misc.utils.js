'use strict'

// ****** check if input is a string with min length
// checks in proper order to avoid errors
export const isStringAndGreaterThanLength = (possibleString, greaterThanLength = 0) => {
	if (
		(possibleString && typeof possibleString == 'object') ||
		typeof possibleString == 'function' ||
		(typeof possibleString == 'string' && possibleString.length > greaterThanLength)
	) {
		return true
	} else {
		return false
	}
}

// ****** converts an array of Objects into one Object
// Example:
//   Input:  [ { key: '11', value: '1100' }, { key: '22', value: '2200' } ]
//   Output: { "11": "1100", "22": "2200" }
export const arrayOfObjectsToOneObject = (arrayOfObjects, key, value) => {
	return arrayOfObjects.reduce((obj, item) => ((obj[item[key]] = item[value]), obj), {})
}
