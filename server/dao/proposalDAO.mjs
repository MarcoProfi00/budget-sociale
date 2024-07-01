/**
 * Data Access Object (DAO) module for accessing proposal data
 */

import Proposal, { ProposalWithVote } from "../components/Proposal.mjs";
import db from "../db/db.mjs"
import { ProposalsNotFoundError, ProposalAlreadyExistsError, UnauthorizedUserError, UnauthorizedUserErrorVote, VoteNotFoundError } from "../errors/proposalError.mjs";

/**
 * Funzione che mappa le righe delle get in un array
 * @param {*} rows righe di una get
 * @returns array di Proposal
 */
function mapRowsToProposal(rows){
    return rows.map(row => new Proposal(row.id, row.user_id, row.description, row.cost, row.approved))
}

function mapRowsToProposalWithScore(rows){
    return rows.map(row => new ProposalWithVote(row.id, row.description, row.cost, row.score))
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
     * Crea una nuova proposta e salva le informazioni nel database
     * Se la proposta esiste gia ritorna errore
     * @param {*} proposal oggetto proposta da aggiungere
     * @returns La promise si risolve ritornando la proposta appena aggiunta
     */
    this.addProposal = (proposal) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Proposal WHERE description = ?"
            db.get(sql, [proposal.description], (err, row) => {
                if (err){
                    reject(err)
                } else if(row) {
                    reject(new ProposalAlreadyExistsError())
                } else {
                    sql = "INSERT INTO Proposal (user_id, description, cost, approved) VALUES (?, ?, ?, ?)";
                    db.run(sql, [proposal.userId, proposal.description, proposal.cost, proposal.approved], function (err) {
                    if (err){
                        reject(err);
                    } else {
                        proposal.id = this.lastID;
                        resolve(proposal)
                        /*//creo la riga nella tabella n senza impostare user_id che sarà quello che vota
                        sql = "INSERT INTO Vote (proposal_id, score) VALUES (?, 0)"; //score = 0 default
                        db.run(sql, [proposal.id], function(err) {
                            if(err) {
                                reject(err);
                            }
                            resolve(proposal);
                        })
                        */
                    }
                    });
                }
            });
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
                    /*//elimino prima la riga nella tabella più interna (Vote) per i costains
                    sql = "DELETE FROM Vote WHERE proposal_id = ? AND user_id = ?";
                    db.run(sql, [id, userId], function (err){
                        if(err) {
                            reject(err)
                        } else {
                         */
                            //elimino la riga nella tabella più esterna (Proposal)
                            sql = "DELETE FROM Proposal WHERE id = ? AND user_id = ?";
                            db.run(sql, [id, userId], function(err){
                                if(err) {
                                    reject(err);
                                } else {
                                    console.log(this.changes)
                                    resolve(this.changes);
                                //}
                           // })
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


}