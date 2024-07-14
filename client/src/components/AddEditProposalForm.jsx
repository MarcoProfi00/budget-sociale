import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { usePhase } from '../contexts/PhaseContext.jsx';
import { BiArrowBack } from 'react-icons/bi';
import API from '../API';

/**
 * Componente che gesisce l'aggiunta o la modifica di una proposta
 * @prop {proposal, mode, user} props Props passate in input: proposal, mode (add o edit), user
 */
const AddEditProposalForm = ({ proposal, mode, user }) => {
    const { proposalId } = useParams(); //Hook per estrarre dall'URL l'id della proposta
    const { budget, fase, getBudgetAndFase } = usePhase(); //Stati del context per gestire fase e budget
    const navigate = useNavigate(); //Hook per navigare tra le pagine
    const [waiting, setWaiting] = useState(false); //Stato per l'attesa durante l'invio di un form
    
    // Stato che contiene la description della proposta (se esiste), altrimenti stringa vuota
    const [description, setDescription] = useState(proposal ? proposal.description : '');
    
    // Stato che contiene il cost della proposta (se esiste), altrimenti 0
    const [cost, setCost] = useState(proposal ? proposal.cost : 0);
    
    const [alertVariant, setAlertVariant] = useState('danger'); // Stato per l'alert inizialmente rosso
    const [alertMessage, setAlertMessage] = useState(null); //Stato per il messaggio inizialmente null

    // Titolo dinamico del form in base alla modalità (Add o Edit)
    const formTitle = mode === 'edit' ? 'Modifica Proposta' : 'Aggiungi Nuova Proposta';

    /**
     * UseEffect per recuperare fase e budget attuale
     * Richiama la funzione getBudgetAndFase dal context
     */
    useEffect(() => {
      const fetchData = async () => {
      try {
          await getBudgetAndFase()
      } catch (error) {
          console.error('Error fetching budget and fase:', error);
          setAlertMessage('Errore nel recupero del budget e della fase');
          setAlertVariant('danger');
      }
  };
  
      fetchData(); // Chiamo la funzione all'avvio del componente
  }, [getBudgetAndFase]);

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
     * Controlla le validazioni degli input e in che fase ci si trova
     */
    const handleSubmit = async (event) => {
      
      
        event.preventDefault(); //permette la submission

        // Controllo se la descrizione è troppo lunga
        if (description.length > 50) {
          setAlertVariant('danger');
          setAlertMessage('La descrizione è troppo lunga, puoi inserire al massimo 50 caratteri');
          return;
        }

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
          setAlertMessage('Il costo della proposta deve essere maggiore di 0');
          return;
        }

        setWaiting(true); //Attendo l'operazione e il bottone si disattiva temporaneamente
    
        try {
          if (fase !== 1) {
            setAlertMessage("Fase errata! Non puoi aggiungere o modificare proposte");
            setAlertVariant('danger');
            setTimeout(() => {
              setAlertMessage(null);
            }, 2000);
            return;
          }

          if (mode === 'edit') {
            await API.updateProposal({ id: proposalId, ...newProposal }); //In input passo un oggetto che contiene l'id della proposta e le nuove nuove informazioni
            setAlertVariant('success');
            setAlertMessage('Proposta aggiornata correttamente.');
            setTimeout(() => {
              setAlertMessage(null);
            }, 2000);
          } else {
            await API.addProposal(newProposal);
            setAlertVariant('success');
            setAlertMessage('Proposta aggiunta correttamente.');
            setTimeout(() => {
              setAlertMessage(null);
            }, 2000);
          }
    
          setTimeout(() => {
            setAlertMessage(null);
            navigate('/myproposals'); // Naviga alla pagina delle proprie proposte dopo 2 sec
          }, 2000);
        } catch (error) {
          console.error('Error:', error);
          setAlertMessage('Si è verificato un errore durante l\'operazione');
          setTimeout(() => {
            setAlertMessage(null);
          }, 2000);
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
              <div className="d-flex align-items-center">
                <Form.Control 
                  type="text" 
                  required 
                  value={description} 
                  maxLength={50}
                  onChange={(e) => setDescription(e.target.value)} 
                />
                <span className="ms-2">{description.length}/50</span>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cost</Form.Label>
              <InputGroup>
                <InputGroup.Text>€</InputGroup.Text>
                <Form.Control 
                  type="number" 
                  required 
                  value={cost} 
                  onChange={(e) => setCost(e.target.value)} 
                />
              </InputGroup>
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