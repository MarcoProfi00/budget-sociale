import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';


export function AdminLayout({ user, fase }) {
    return (
        <Container>
            <Row>
                <Col>
                    <nav className="navbar navbar-light bg-light">
                        <span className="navbar-brand">Welcome, {user.name} {user.surname} {user.role}</span>
                    </nav>
                </Col>
            </Row>
            <Row>
                <Col>
                    <nav className="navbar navbar-light bg-light">
                        <span className="navbar-brand">Phase: {fase}</span>
                    </nav>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form>
                        <Form.Group controlId="budgetForm">
                            <Form.Label>Insert Budget</Form.Label>
                            <Form.Control type="text" placeholder="Enter budget" />
                        </Form.Group>
                        <Button variant="primary">Submit</Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

// Layout per il membro
export function MemberLayout({ user, fase }) {
    return (
        <Container>
            <Row>
                <Col>
                    <nav className="navbar navbar-light bg-light">
                        <span className="navbar-brand">Welcome, {user.name} {user.surname} {user.role}</span>
                    </nav>
                </Col>
            </Row>
            <Row>
                <Col>
                    <nav className="navbar navbar-light bg-light">
                        <span className="navbar-brand">Phase: {fase}</span>
                    </nav>
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>The proposal definition phase is still closed. Please try again later.</p>
                </Col>
            </Row>
        </Container>
    );
}

// Componente Phase0Page che decide quale layout mostrare in base al ruolo dell'utente
export function Phase0Page({ user, fase }) {
    return (
        <div className="min-vh-100 d-flex flex-column">
            {user.role === 'Admin' ? (
                <AdminLayout user={user} fase={fase} />
            ) : (
                <MemberLayout user={user} fase={fase} />
            )}
        </div>
    );
}

export default Phase0Page;