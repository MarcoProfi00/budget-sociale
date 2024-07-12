
/**
 * Costruttore di User
 * @param {*} id id dell'utente
 * @param {*} name nome dell'utente
 * @param {*} surname cognome dell'utente
 * @param {*} role ruolo dell'utente(Admin o Member)
 * @param {*} username email dell'utente
 */
export default function User(id, name, surname, role, username){
    this.id = id;
    this.name = name;
    this.surname = surname;
    this.role = role;
    this.username = username;

}

/**
 * Oggetto immutabile (freeze) con due possibilità (Admin o Member)
 */
const Role = Object.freeze({
    ADMIN: "Admin",
    MEMBER: "Member"
});

export { Role }