

const SERVER_URL = 'http://localhost:3001/api';

/**
 * Esegue la login
 * Vuole username e password dentro all'oggetto "credentials"
 */
const logIn = async (credentials) => {
    return await fetch(SERVER_URL + '/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        //questo parametro specifica che il cookie di autenticazione deve essere inoltrato. È incluso in tutte le API autenticate.
        credentials: 'include',
        body: JSON.stringify(credentials),
    }).then(handleInvalidResponse)
    .then(response => response.json());
};

/**
 * Verifica se l'utente è ancora loggato
 * Ritorna un oggetto JSON con le info dello user
 */
const getUserInfo = async () => {
    return await fetch(SERVER_URL + '/sessions/current', {
        credentials: 'include'
    })
    .then(handleInvalidResponse)
    .then(response => response.json())
    .then(data => {
        setUserRole(data.role); // Imposta il ruolo dell'utente nello stato
        return data; // Restituisci tutti i dati dell'utente, se necessario
    });
};

/**
   * Esegue il logout eliminando la sessione corrente
   */
const logOut = async() => {
    return await fetch(SERVER_URL + '/sessions/current', {
      method: 'DELETE',
      credentials: 'include'
    }).then(handleInvalidResponse);
}


function handleInvalidResponse(response) {
    if (!response.ok) { throw Error(response.statusText) }
    let type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1){
        throw new TypeError(`Expected JSON, got ${type}`)
    }
    return response;
}

const API = {logIn, getUserInfo, logOut}
export default API;

  