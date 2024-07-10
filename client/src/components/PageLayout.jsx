import {Col, Row} from "react-bootstrap";
import {Link} from "react-router-dom";


export function NotFoundLayout() {
    return (
        <>
            <Row><Col><h2>Error: page not found!</h2></Col></Row>
            <Row><Col> <img src="404.png" alt="page not found" className="my-3" style={{display: 'block'}}/>
            </Col></Row>
            <Row><Col> <Link to="/" className="btn btn-primary mt-2 my-5">Go Home!</Link> </Col></Row>
        </>
    );
}