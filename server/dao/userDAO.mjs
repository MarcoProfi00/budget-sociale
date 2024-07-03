/**
 * Data Access Object (DAO) module for accessing user data
 */
import db from "../db/db.mjs"
import crypto from 'crypto';
import { UserNotFoundError } from "../errors/userError.mjs";
import { rejects } from "assert";
import { NotAdminError, NotAdminErrorBudget, UnauthorizedUserError } from "../errors/proposalError.mjs";
import Budget from "../components/Budget.mjs";

export default function UserDAO() {
    
    /**
     * Recupera l'utente dato il suo id
     * @param {*} id id dell'utente da trovare
     * @returns La promise si risolve restituendo l'utente
     */
    this.getUserById = (id) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM User WHERE id = ?";
            db.get(query, [id], (err, row) => {
                if(err){
                    reject(err)
                } else if (row === undefined) {
                    reject (new UserNotFoundError())
                } else {
                    resolve(row)
                }
            })
        })
    }

    this.getUserByCredentials = (username, password) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM User WHERE username = ?";
            db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row === undefined) {
                    resolve(false);
                } else {
                    const user = { id: row.id, name: row.name, surname: row.surname, role: row.role, username: row.username }
                    crypto.scrypt(password, row.salt, 64, function(err, hashedPassword) {
                        if(err)
                            reject(err)
                        //controlliamo se hash crittografico è uguale a quello slavato nel db
                        if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) // WARN: it is hash and not password (as in the week example) in the DB
                            resolve(false); //se non è uguale resolve con false
                        else
                            resolve(user); //se è uguale resolve con true
                    });
                }
            })
        })
    }

    /**
     * Crea un nuovo budget
     * @param {*} userId id dell'utente che lo inserisce (admin)
     * @param {*} budget oggetto budget da aggiungere
     * @returns La promise si risolve ritornando l'oggetto budget
     */
    this.insertBudget = (userId, budget) => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM User WHERE id = ? AND role = 'Admin'";
            db.get(sql, [userId], (err, row) => {
                if(err){
                    reject(err);
                } else if (!row) {
                    reject(new NotAdminErrorBudget())
                } else {
                    sql = "INSERT INTO Budget (amount) VALUES (?)";
                    db.run(sql, [budget.amount], function (err){
                        if (err){
                            reject(err);
                        } else {
                            budget.id = this.lastID;
                            resolve(budget)
                        }
                    })
                }
            })
        })
    }

    /**
     * Recupera il budget
     * @returns La promise si risolve ritornando l'oggetto budget
     */
    this.getBudget = () => {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM Budget";
            db.get(sql, (err, row) => {
                if(err) {
                    reject(err)
                } else if (!row){
                    reject(new BudgetNotExistError())
                } else {
                    const budget = new Budget(row.id, row.amount)
                    resolve(budget)
                }
            })
        })
    }
}