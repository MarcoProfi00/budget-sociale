import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const Phase1Page = ({ user }) => {
  return (
    <Container fluid className="gap-3 align-items-center">
      <Row>
        <Col>
          <h1>Fase 1</h1>
          <p>Benvenuto nella fase 1 del progetto!</p>
          <p>Questa è una pagina vuota di esempio per la fase 1.</p>
          <p>Puoi aggiungere qui il contenuto specifico per questa fase.</p>
          {user && user.role === 'Admin' && (
            <Button variant="primary" className="mt-3">
              Azione specifica per Admin
            </Button>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Phase1Page;