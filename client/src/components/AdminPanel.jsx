
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const AdminPanel = () => {
    const [budget, setBudget] = useState('');

    const handleBudgetSubmit = (e) => {
        e.preventDefault();
        // Qui puoi implementare la logica per inviare il budget al server, ad esempio con una chiamata API
        console.log('Budget submitted:', budget);
        // Esempio: API.saveBudget(budget).then(response => { console.log('Budget saved:', response); });
    };

    return (
        <div>
            <h2>Admin Panel</h2>
            <Form onSubmit={handleBudgetSubmit}>
                <Form.Group controlId="budgetForm">
                    <Form.Label>Insert Budget</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </div>
    );
};

export default AdminPanel;