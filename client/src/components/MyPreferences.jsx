import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert } from 'react-bootstrap';
import { BiArrowBack } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import API from '../API';

const MyPreferences = ({ user }) => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState([]); //Stato per gestire le proposte con le preferenze
  const [alertMessage, setAlertMessage] = useState(null);

  /**
   * UseEffect che recupera le proposte con le preferenze
   */
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        if (user) {
          const preferences = await API.getMyPreferences(user.id);
          setPreferences(preferences);
        } else {
          setPreferences([]);
        }
      } catch (error) {
        //console.error('Error fetching preferences:', error);
        //setAlertMessage('Errore nel recupero delle preferenze');
      }
    };

    fetchPreferences();
  }, [user]);

  /**
   * Funzione che viene chiamata quando premo il bottone per eliminare una preferenza
   * @param {*} proposalId id della proposta di cui voglio eliminare la preferenza
   */
  const handleDeletePreference = async (proposalId) => {
    try {
      await API.deletePreference(user.id, proposalId); // Chiamata all'API per eliminare la preferenza
  
      // Aggiorna lo stato delle preferenze rimuovendo quella eliminata
      setPreferences(preferences.filter((preference) => preference.id !== proposalId));
  
      setAlertMessage("Preferenza eliminata correttamente");
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
    } catch (error) {
      //console.error("Errore nell'eliminazione della preferenza:", error);
      setAlertMessage("Errore nell'eliminazione della preferenza");
    }
  };

  return (
    <Container fluid className="gap-3 align-items-center">
      {/* Freccia indietro per tornare alla pagina precedente */}
      <Button
        variant="link"
        onClick={() => navigate(-1)}
        className="d-inline-flex align-items-center mb-1"
        style={{ fontSize: '1.20rem', padding: '0.70rem', color: 'black' }}
      >
        <BiArrowBack size={16} style={{ marginRight: '5px' }} /> Back
      </Button>

      <Row>
        <Col>
          <Card className="card bg-light mb-3" style={{ maxWidth: '100rem', marginTop: '0.5rem' }}>
            <Card.Header className="text-black">Preferenze espresse</Card.Header>
            <Card.Body className="text-black">
              <Card.Title>Proposte preferite</Card.Title>
              <Card.Text>Puoi revocare le tue preferenze</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alert per il feedback */}
      {alertMessage && (
        <Alert variant="success" onClose={() => setAlertMessage(null)} dismissible>
          {alertMessage}
        </Alert>
      )}

      <Row>
        <Col lg={10} className="mx-auto">
          <MyPreferenceTable preferences={preferences} handleDeletePreference={handleDeletePreference} />
        </Col>
      </Row>
    </Container>
  );
};

/**
 * Componente tabella delle preferenze
 * @param {*} param0 props in input: preferenze (stato), handleDeletePreference (funzione per eliminare una preferenza)
 */
function MyPreferenceTable({ preferences, handleDeletePreference }) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Descrizione proposta</th>
          <th>Costo proposta</th>
          <th>Preferenza</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {preferences.length > 0 ? (
          preferences.map((preference) => (
            <tr key={preference.id}>
              <td>{preference.description}</td>
              <td>{preference.cost}</td>
              <td>{preference.score}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  className="me-2"
                  onClick={() => handleDeletePreference(preference.id)}
                >
                  <i className="bi bi-trash" style={{ fontSize: '0.75rem' }}></i>
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="text-center">Nessuna preferenza trovata</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

export default MyPreferences;