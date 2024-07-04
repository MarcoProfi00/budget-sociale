const PROPOSALS_NOT_FOUND = "Proposals not found"
const PROPOSALS_ALREADY_EXISTS = "Proposal already exists"
const UNAUTHORIZED_USER = "Another user's proposal"
const UNAUTHORIZED_USER_VOTE = "You cannot vote your proposal"
const VOTE_NOT_FOUND = "User has not voted on any proposal"
const NOT_ADMIN = "Only the admin can do the reset"
const NOT_ADMIN_BUDGET = "Only the admin can insert the budget or next phase"
const BUDGET_NOT_EXIST = "Budget not found"
const FASE_ERROR = "The phase not allowed"


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

export class VoteNotFoundError extends Error{
    constructor(){
        super();
        this.message = VOTE_NOT_FOUND;
        this.code = 404;
    }
}

export class NotAdminError extends Error{
    constructor(){
        super();
        this.message = NOT_ADMIN;
        this.code = 403;
    }
}

export class NotAdminErrorBudget extends Error{
    constructor(){
        super();
        this.message = NOT_ADMIN_BUDGET;
        this.code = 403;
    }
}

export class BudgetNotExistError extends Error{
    constructor(){
        super();
        this.message = BUDGET_NOT_EXIST;
        this.code = 404;
    }
}

export class FaseError extends Error{
    constructor(){
        super();
        this.message = FASE_ERROR;
        this.code = 403;
    }
}



