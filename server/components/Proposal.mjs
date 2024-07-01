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

