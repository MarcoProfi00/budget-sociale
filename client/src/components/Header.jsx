import PropTypes from "prop-types";
import { Col, Container, Row } from "react-bootstrap";
import { LogoutButton, LoginButton } from './Auth';
import { Link } from 'react-router-dom';
import '../App.css';

function Header(props) {
    return (
        <header className="py-1 py-md-3 border-bottom dark-green-bg">
            <Container fluid className="gap-3 align-items-center">
                <Row>
                    <Col xs={4} md={4}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                                <i className="bi bi-cash-coin me-2" style={{ color: 'white' }}></i>
                                <span className="h5 mb-0" style={{ color: 'white' }}>Budget Sociale</span>
                            </Link>
                        </div>
                    </Col>
                    
                    <Col xs={5} md={8} className="d-flex align-items-center justify-content-end">
                        {props.loggedIn &&
                            <form className={`d-none d-md-block w-100 me-3`}>
                                {/* Contenuto eventualmente aggiunto */}
                            </form>
                        }
                        <span className="ml-md-auto">
                            {/* Bottoni login/logout */}
                            {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
                        </span>
                    </Col>
                </Row>
            </Container>
        </header>
    );
}

Header.propTypes = {
    logout: PropTypes.func,
    user: PropTypes.object,
    loggedIn: PropTypes.bool
};

export default Header;