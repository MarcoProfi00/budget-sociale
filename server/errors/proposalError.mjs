const PROPOSALS_NOT_FOUND = "Proposals not found"
const PROPOSALS_ALREADY_EXISTS = "Proposal already exists"
const UNAUTHORIZED_USER = "Another user's proposal"

/**
 * Rappresenta l'erroe che appare se non ci sono proposte
 */
export class ProposalsNotFoundError extends Error{
    constructor(){
        super();
        this.message = PROPOSALS_NOT_FOUND;
        this.code = 404;
    }
}

export class ProposalAlreadyExistsError extends Error{
    constructor(){
        super();
        this.message = PROPOSALS_ALREADY_EXISTS;
        this.code = 404;
    }
}

export class UnauthorizedUserError extends Error{
    constructor(){
        super();
        this.message = UNAUTHORIZED_USER;
        this.code = 404;
    }
}


