/**
 * Classe che gestisce il costruttore di Proposal e Vote
 */


export default function Proposal(id, userId, description, cost, approved = 0) {
    this.id = id;
    this.userId = userId;
    this.description = description;
    this.cost = cost;
    this.approved = approved;
}

export function Vote(userId, proposalId, score = 0) {
    this.userId = userId;
    this.proposalId = proposalId;
    this.score = score;
}

export function ProposalWithVote(id, description, cost, score) {
    this.id = id;
    this.description = description;
    this.cost = cost;
    this.score = score;
}

export function ProposalsWhithSumOfScore(id, userId, description, cost, approved, total_score) {
    this.id = id,
    this.userId = userId;
    this.description = description;
    this.cost = cost;
    this.approved = approved;
    this.total_score = total_score;
}

export function ProposalsApproved(id, description, member_name, cost, total_score) {
    this.id = id;
    this.description = description;
    this.member_name = member_name;
    this.cost = cost;
    this.total_score = total_score;
}

export function ProposalsNotApproved(id, description, cost, total_score) {
    this.id = id,
    this.description = description;
    this.cost = cost;
    this.total_score = total_score;
}

