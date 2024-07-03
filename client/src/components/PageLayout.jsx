import { useContext } from "react";
import {Col, Collapse, Row} from "react-bootstrap";
import {Link, Outlet, useLocation, useParams} from "react-router-dom";
import FeedbackContext from "../contexts/FeedbackContext.js";
import API from "../API.js";

export function NotFoundLayout() {
    return (
        <>
            <Row><Col><h2>Error: page not found!</h2></Col></Row>
            <Row><Col> <img src="/GitHub404.png" alt="page not found" className="my-3" style={{display: 'block'}}/>
            </Col></Row>
            <Row><Col> <Link to="/" className="btn btn-primary mt-2 my-5">Go Home!</Link> </Col></Row>
        </>
    );
}