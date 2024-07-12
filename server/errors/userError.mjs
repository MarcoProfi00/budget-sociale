/**
 * Gestisce gli errori dell'user
 */
const USER_NOT_FOUND = "User Not Found"

export class UserNotFoundError extends Error{
    constructor(){
        super();
        this.message = USER_NOT_FOUND;
        this.code = 404;
    }
}