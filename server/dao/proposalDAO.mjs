/**
 * Data Access Object (DAO) module for accessing proposal data
 */
import Proposal, { ProposalWithVote, ProposalsApproved, ProposalsNotApproved, ProposalsWhithSumOfScore } from "../components/Proposal.mjs";
import db from "../db/db.mjs"
import { ProposalOverToBudgetError, ProposalsNotFoundError, ProposalAlreadyExistsError, AlreadyThreeProposalsError, UnauthorizedUserError, UnauthorizedUserErrorVote, VoteNotFoundError, NotAdminError, BudgetNotExistError } from "../errors/proposalError.mjs";

function mapRowsToProposal(rows){
    return rows.map(row => new Proposal(row.id, row.user_id, row.description, row.cost, row.approved))
}

function mapRowsToProposalWithScore(rows){
    return rows.map(row => new ProposalWithVote(row.id, row.description, row.cost, row.score))
}

function mapRowsToProposalsWithSumOfScore(rows){
    return rows.map(row => new ProposalsWhithSumOfScore(row.id, row.user_id, row.description, row.cost, row.approved, row.total_score))
}

function mapRowsToProposalsApproved(rows){
    return rows.map(row => new ProposalsApproved(row.id, row.description, row.member_name, row.cost, row.total_score))
}

function mapRowsToProposalsNotApproved(rows){
    return rows.map(row => new ProposalsNotApproved(row.id, row.description, row.cost, row.total_score))
}

export default function ProposalDAO() {
    /**
     * Recupera tutte le proposte create da uno specifico utente
     * @param {*} userId id dell'utente che ha inserito la proposta 
     * @returns La promise si risolve in un array di proposte
     */
    this.getProposalById = (userId) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Proposal WHERE user_id = ?";
            db.all(sql, [userId], (err, rows) => {
                if(err) {
                    reject(err);
                } else if (rows.length === 0){
                    reject(new ProposalsNotFoundError())
                } else {
                    const proposals = mapRowsToProposal(rows)
                    resolve(proposals);
                }
            }); 
        });
    }

    /**
     * Recupera la proposta dato il suo id
     * @param {*} proposalId id della proposta da recuperare
     * @returns La promise si risolve ritornando la proposta
     */
    this.getOnceProposalById = (proposalId) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Proposal WHERE id = ?";
            db.get(sql, [proposalId], (err, row) => {
                if(err) {
                    reject(err);
                } else if (!row) {
                    reject(new ProposalsNotFoundError())
                } else {
                    const proposal = new Proposal(row.id, row.user_id, row.description, row.cost, row.approved);
                    resolve(proposal)
                }
            })
        })
    }

    /**
     * Crea una nuova proposta e salva le informazioni nel database
     * Se la proposta esiste gia ritorna errore
     * @param {*} proposal oggetto proposta da aggiungere
     * @returns La promise si risolve ritornando la proposta appena aggiunta
     */
    this.addProposal = (proposal, userId) => {
        return new Promise((resolve, reject) => {
            //query per controllare quante proposte ha l'utente
            let sql = "SELECT COUNT(*) AS count FROM Proposal WHERE Proposal.user_id = ?"
            db.get(sql, [userId], (err, row) => {
                if(err) {
                    reject(err);
                } else {
                    //mi prendo il numero di proposte
                    let number = row.count
                    if(number >= 3) {
                        reject(new AlreadyThreeProposalsError())
                    } else {
                        sql = "SELECT amount FROM BudgetSociale";
                        db.get(sql, (err, row) => {
                            if (err) {
                                reject(err);
                            } else if (!row) {
                                reject(new BudgetNotExistError());
                            } else {
                                let budget = row.amount;
                                sql = "SELECT * FROM Proposal WHERE description = ?";
                                db.get(sql, [proposal.description], (err, row) => {
                                    if (err) {
                                        reject(err);
                                    } else if (row) {
                                        reject(new ProposalAlreadyExistsError());
                                    } else if (proposal.cost > budget) {
                                        reject(new ProposalOverToBudgetError());
                                    } else {
                                        sql = "INSERT INTO Proposal (user_id, description, cost, approved) VALUES (?, ?, ?, ?)";
                                        db.run(sql, [proposal.userId, proposal.description, proposal.cost, proposal.approved], function (err) {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                proposal.id = this.lastID;
                                                resolve(proposal);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } 
                }
            })
        });
    };


    /**
     * Modifica una proposta gia esistente dato il suo id e userId
     * @param {*} userId id dell'utente che ha inserito la proposta e la vuole modificare
     * @param {*} id id della proposta
     * @param {*} proposal oggetto proposta contenente le modifiche
     * @returns La promise si risolve ritornando la proposta modificata
     */
    this.updateProposal = (userId, id, proposal) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Proposal WHERE id = ? AND user_id = ?";
            db.get(sql, [id, userId], (err, row) => {
                if(err) {
                    reject(err);
                } else if(!row){
                    reject(new UnauthorizedUserError())
                } else {
                    sql = "UPDATE Proposal SET description = ?, cost = ?, approved = 0 WHERE id = ? AND user_id = ?"
                    db.run(sql, [proposal.description, proposal.cost, id, userId], function (err){
                        if(err){
                            reject(err)
                        }
                        if (this.changes !== 1){
                            reject(new ProposalsNotFoundError())
                        } else {
                            resolve(proposal)
                        }
                    })
                }
            })
            
        });
    };

    /**
     * Elimina la proposta dato il suo e userId dell'utente che l'ha creata
     * @param {*} userId id dell'utente che l'ha creata
     * @param {*} id id della proposta
     * @returns La promise si risolve eliminando la proposta e ritornando il numero di cambiamenti
     */
    this.deleteProposal = (userId, id) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Proposal WHERE id = ? AND user_id = ?";
            db.get(sql, [id, userId], (err, row) => {
                if(err) {
                    reject(err);
                } else if(!row){
                    reject(new UnauthorizedUserError())
                } else {
                    sql = "DELETE FROM Proposal WHERE id = ? AND user_id = ?";
                    db.run(sql, [id, userId], function(err){
                        if(err) {
                            reject(err);
                        } else {
                            resolve(this.changes);
                        }
                    })
                }
            })
        })
    }

    /**
     * Recupera tutte le proposte presenti nel database
     * @returns La promise si risolve in un array di proposte
     */
    this.getAllProposals = () => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Proposal";
            db.all(sql, (err, rows) => {
                if(err) {
                    reject(err);
                } else if (rows.length === 0){
                    reject(new ProposalsNotFoundError())
                } else {
                    const proposals = mapRowsToProposal(rows)
                    resolve(proposals);
                }
            })
        })
    }

    /**
     * Vota una proposta dato il suo id controllando che non sia la propria proposta
     * @param {*} userId id dell'utente che vota
     * @param {*} id id della proposta da votare
     * @param {*} score score 1 - 2 - 3
     * @returns La promise si risolve ritornando lo score se la votazione va a buon fine
     */
    this.voteProposal = (userId, id, score) => { //userId -> utente che la chiama
        return new Promise((resolve, reject) => {
            //controllo se la proposta è la propria
            let sql = "SELECT * FROM Proposal WHERE id = ? AND user_id = ?";
            db.get(sql, [id, userId], (err, row) => {
                if(err) {
                    reject(err);
                } else if(!row){
                    //se non trova la riga vuol dire che la proposta non è la propria e quindi si può votare
                    sql = "INSERT INTO Vote (user_id, proposal_id, score) VALUES (?, ?, ?)";
                    db.run(sql, [userId, id, score], function (err){
                        if(err){
                            reject(err)
                        } else {
                            resolve(score)
                        }
                    })
                } else {
                    reject(new UnauthorizedUserErrorVote())
                }
            })
        });
    }

    /**
     * Recupera le proposte votate da un utente dato il suo id
     * @param {*} userId id dell'utente che vota
     * @returns La promise si risolve in un array di proposte contentente (id_proposta, description, cost e vote)
     */
    this.getOwnPreference = (userId) => {
        return new Promise((resolve, reject) => {
            // Query che ritorna la lista di proposal votate da un utente (userId)
            let sql = `SELECT Proposal.id, Proposal.description, Proposal.cost, Vote.score 
                       FROM Proposal, Vote 
                       WHERE Proposal.id = Vote.proposal_id AND Vote.user_id = ?;`;
            db.all(sql, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else if (rows.length === 0) {
                    reject(new VoteNotFoundError());
                } else {
                    const proposals = mapRowsToProposalWithScore(rows);
                    resolve(proposals);
                }
            });
        });
    }

    /**
     * Elimina la preferenza a una proposta precedentemente espressa
     * @param {*} userId id dell'utente che ha espesso la preferenza e vuole eliminarla
     * @param {*} proposalId id della proposta
     * @returns La promise si risolve eliminando la proposta e ritornando il numero di cambiamenti
     */
    this.deleteOwnPreference = (userId, proposalId) => {
        return new Promise((resolve, reject) => {
            //query per verificare se è possibile eliminare lo score della proposta
            let sql = "SELECT * FROM Vote WHERE user_id = ? AND proposal_id = ?";
            db.get(sql, [userId, proposalId], (err, row) => {
                if(err) {
                    reject(err);
                    //se la riga è vuota vuol dire che non è possibile eliminare lo score di quella proposta perchè non è stata votata dallo user 
                } else if(!row){
                    reject(new UnauthorizedUserError())
                } else {
                    //query per eliminare la riga della votazione
                    sql = "DELETE FROM Vote WHERE user_id = ? AND proposal_id = ?";
                    db.run(sql, [userId, proposalId], function (err) {
                        if(err){
                            reject(err)
                        } else {
                            resolve(this.changes);
                        }
                    })
                }
            })
        })
    }

    /**
     * Recupera le proposte in ordine decrescente di total_score (score uguali vengono sommati)
     * @returns La promise si risolve ritornando l'array delle proposte
     */
    this.getProposalsOrderedToScore = () => {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    Proposal.id,
                    Proposal.user_id,
                    Proposal.description,
                    Proposal.cost,
                    Proposal.approved,
                    COALESCE(SUM(Vote.score), 0) AS total_score
                FROM
                    Proposal
                LEFT JOIN
                    Vote ON Proposal.id = Vote.proposal_id
                GROUP BY
                    Proposal.id, Proposal.user_id, Proposal.description, Proposal.cost, Proposal.approved
                ORDER BY
                    total_score DESC;
            `;
            db.all(sql, (err, rows) => {
                if (err) {
                    console.error('Error in getProposalsOrdered:', err);
                    reject(err);
                } else if (rows.length === 0) {
                    reject(new ProposalsNotFoundError());
                } else {
                    const proposals = mapRowsToProposalsWithSumOfScore(rows);
                    resolve(proposals);
                }
            });
        });
    };

    /**
     * Approva le proposte in base al budget
     * Richiama la promise "getProposalsOrderedToScore" in await per ordinare le proposte secondo il total_score in ordine decrescente
     * Crea una transazione in cui in un ciclo for in cui viene aggiornato il campo approved delle proposte che rientrano nel budget
     * @param {*} budget budget da rispettare
     * @returns La promise si risolve ritornando true se l'approvazione va a buon fine
     */
    this.approveProposals = () => {
        return new Promise(async (resolve, reject) => {
            let totalCost = 0;
            const selectedProposals = [];
            //richiamo la promise precedente per ottenere l'array di proposte ordinate in base allo score totale
            const proposals = await this.getProposalsOrderedToScore();
            
            let sql = "SELECT * FROM BudgetSociale";
            db.get(sql, (err, row) => {
                if(err) {
                    reject(err);
                } else {
                    const budget = row.amount
                    for (let i = 0; i < proposals.length; i++){
                        if(totalCost + proposals[i].cost <= budget){
                            selectedProposals.push(proposals[i]);
                            totalCost += proposals[i].cost;
                            if(totalCost >= budget) {
                                break
                            }
                        } else {
                            break
                        }
                    }
                    sql = "BEGIN TRANSACTION;";
                    for(let i = 0; i < selectedProposals.length; i++){
                        //query per aggiornare il campo approved delle proposte all'interno del budget
                        sql += `UPDATE Proposal SET approved = 1 WHERE id = '${selectedProposals[i].id}';`
                    }
                    sql += "COMMIT;";
                    db.exec(sql, function(err) {
                        if(err){
                            reject(err)
                        } else {
                            resolve(true)
                        }
                    })
                }
            }) 
        })
    }

    /**
     * Recupera le proposte approvate (approved = 1) in ordine decrescende di total_cost
     * @returns La promise si risolve ritornando l'array delle proposte
     */
    this.getProposalApproved = () => {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    Proposal.id,
                    Proposal.description,
                    User.name || ' ' || User.surname AS member_name,	    
                    Proposal.cost,
                    COALESCE(SUM(Vote.score), 0) AS total_score
                FROM 
                    Proposal
                LEFT JOIN 
                    Vote ON Proposal.id = Vote.proposal_id
                JOIN
                    User ON Proposal.user_id = User.id
                WHERE
                    Proposal.approved = 1
                GROUP BY 
                    Proposal.id, Proposal.description, User.name, User.surname, Proposal.cost
                ORDER BY 
                    total_score DESC;
            `;
            db.all(sql, (err, rows) => {
                if(err) {
                    console.error('Error in getProposalsApproved:', err);
                    reject(err);
                } else if (rows.length === 0) {
                    reject(new ProposalsNotFoundError());
                } else {
                    const proposals = mapRowsToProposalsApproved(rows);
                    resolve(proposals);
                }
            })
        })
    }

    /**
     * Recupera le proposte non approvate (approved = 0) in ordine decrescende di total_cost
     * @returns La promise si risolve ritornando l'array delle proposte
     */
    this.getProposalNotApproved = () => {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT 
                    Proposal.id,
                    Proposal.description,    
                    Proposal.cost,
                    COALESCE(SUM(Vote.score), 0) AS total_score
                FROM 
                    Proposal
                LEFT JOIN 
                    Vote ON Proposal.id = Vote.proposal_id
                WHERE
                    Proposal.approved = 0
                GROUP BY 
                    Proposal.id, Proposal.description, Proposal.cost
                ORDER BY 
                    total_score DESC;
            `;
            db.all(sql, (err, rows) => {
                if(err) {
                    console.error('Error in getProposalsApproved:', err);
                    reject(err);
                } else if (rows.length === 0) {
                    reject(new ProposalsNotFoundError());
                } else {
                    const proposals = mapRowsToProposalsNotApproved(rows);
                    resolve(proposals);
                }
            })
        })
    }
}