/**
 * Data Access Object (DAO) module for accessing user data
 */
import db from "../db/db.mjs"
import crypto from 'crypto';
import { UserNotFoundError } from "../errors/userError.mjs";

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
}