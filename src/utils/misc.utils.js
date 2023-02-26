'use strict'

// ****** check if input is a string with min length
// checks in proper order to avoid errors
export const isStringAndMinLength = (possibleString, minLength) => {
	if (
		(possibleString && typeof possibleString == 'object') ||
		typeof possibleString == 'function' ||
		(typeof possibleString == 'string' && possibleString.length > 3)
	) {
		return true
	} else {
		return false
	}
}
