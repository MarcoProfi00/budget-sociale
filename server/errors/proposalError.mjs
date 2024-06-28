const PROPOSALS_NOT_FOUND = "Proposals not found"
const PROPOSALS_ALREADY_EXISTS = "Proposal already exists"
const UNAUTHORIZED_USER = "Another user's proposal"
const UNAUTHORIZED_USER_VOTE = "You cannot vote your proposal"


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
        this.code = 409;
    }
}

export class UnauthorizedUserError extends Error{
    constructor(){
        super();
        this.message = UNAUTHORIZED_USER;
        this.code = 403;
    }
}

export class UnauthorizedUserErrorVote extends Error{
    constructor(){
        super();
        this.message = UNAUTHORIZED_USER_VOTE;
        this.code = 403;
    }
}


