import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { usePhase } from '../contexts/PhaseContext.jsx';
import { BiArrowBack } from 'react-icons/bi';
import API from '../API';

/**
 * Componente che viene renderizzato quando si vuoloe aggiungere o modificare una proposta
 * Props passate in input: proposal, mode (add o edit), user
 */
const AddEditProposalForm = ({ proposal, mode, user }) => {
    const { proposalId } = useParams(); //estrae dall'URL l'id della proposta
    const { setFase, budget, setBudget } = usePhase(); //Stati del context per gestire fase e budget
    const navigate = useNavigate(); //hook per navigare tra le pagine
    const [waiting, setWaiting] = useState(false);
    
    // Stato che contiene la description della proposta (se esiste), altrimenti stringa vuota
    const [description, setDescription] = useState(proposal ? proposal.description : '');
    // Stato che contiene il cost della proposta (se esiste), altrimenti 0
    const [cost, setCost] = useState(proposal ? proposal.cost : 0);
    
    const [alertVariant, setAlertVariant] = useState('danger'); // Stato per l'alert inizialmente rosso
    const [alertMessage, setAlertMessage] = useState(null); //Stato per il messaggio inizialmente null

    // Titolo dinamico del form in base alla modalità (Add o Edit)
    const formTitle = mode === 'edit' ? 'Modifica Proposta' : 'Aggiungi Nuova Proposta';

    /**
     * UseEffect per recuperare i dettagli della proposta
     * Lo uso solo in modalità edit
     */
    useEffect(() => {
        const fetchProposalDetails = async () => {
          try {
            if (mode === 'edit' && proposalId) {
              const proposal = await API.getProposalById(proposalId);
              setDescription(proposal.description);
              setCost(proposal.cost);
            }
          } catch (error) {
            console.error('Error fetching proposal details:', error);
            setAlertMessage('Errore nel recupero dei dettagli della proposta');
          }
        };
    
        fetchProposalDetails();
    }, [mode, proposalId]);
    
    /**
     * Funzione che gestisce l'invio del form
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        //controllo se il cost della proposal è maggiore del budget
        if (cost > budget) {
            setAlertVariant('danger');
            setAlertMessage('Il costo della proposta non può essere superiore del budget.');
            return;
        }
        
        const newProposal = { userId: user.id, description, cost, approved: 0 };

        // Controllo se la descrione è un numero (errore)
        if (!isNaN(description)) {
          setAlertVariant('danger');
          setAlertMessage('La descrizione della proposta non può essere un numero');
          return;
        }

        //Controllo se il costo della proposta è positivo
        if(cost <= 0) {
          setAlertVariant('danger');
          setAlertMessage('Il costo della proposta deve essere maggiore di 0')
          return
        }

        setWaiting(true);
    
        try {
          if (mode === 'edit') {
            await API.updateProposal({ id: proposalId, ...newProposal }); //In input passo un oggetto che contiene l'id della proposta e le nuove nuove informazioni
            setAlertVariant('success');
            setAlertMessage('Proposta aggiornata correttamente.');
          } else {
            await API.addProposal(newProposal);
            setAlertVariant('success');
            setAlertMessage('Proposta aggiunta correttamente.');
          }
    
          setTimeout(() => {
            setAlertMessage(null);
            navigate('/myproposals'); // Naviga alla pagina delle proprie proposte dopo 3 sec
          }, 1000);
        } catch (error) {
          console.error('Error:', error);
          setAlertMessage('Si è verificato un errore durante l\'operazione.');
          setWaiting(false);
        }
    };
    
    return (
        <>
          {alertMessage && (
            <Alert variant={alertVariant} onClose={() => setAlertMessage(null)} dismissible>
              {alertMessage}
            </Alert>
          )}

          {/* Pulsante per tornare indietro */}
          <Button
            variant="link"
            onClick={() => navigate(-1)} //naviga alla pagina precedente
            className="d-inline-flex align-items-center mb-3"
            style={{ fontSize: '1.20rem', padding: '0.80rem', color: 'black' }}
          >
            <BiArrowBack size={16} style={{ marginRight: '5px' }} /> Back
          </Button>

          <h2>{formTitle}</h2>

          {/* Form per aggiungere o modificare una proposta */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                type="text" 
                required 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cost</Form.Label>
              <Form.Control 
                type="number" 
                required 
                value={cost} 
                onChange={(e) => setCost(e.target.value)} 
              />
            </Form.Group>
            
            {/* Diverso colore del pulsante in base al fatto che sto in modalità edit o add */}
            <Button variant={mode === 'edit' ? 'warning' : 'success'} type="submit" disabled={waiting}>
              {mode === 'edit' ? 'Update' : 'Add'}
            </Button>
          </Form>
        </>
    );
};
    
export default AddEditProposalForm;