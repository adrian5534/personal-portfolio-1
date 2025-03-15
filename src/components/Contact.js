import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

function Contact() {
  return (
    <section id="contact">
      <Container>
        <h2>Contact</h2>
        <Row>
          <Col md={6}>
            <h3>Contact Information</h3>
            <p><i className="fas fa-phone-alt"></i> <strong>Phone:</strong> 302-747-4936</p>
            <p><i className="fas fa-envelope"></i> <strong>Email:</strong> <a href="mailto:adrianreynolds5534@gmail.com">adrianreynolds5534@gmail.com</a></p>
          </Col>
          <Col md={6}>
            <h3>Contact Form</h3>
            <Form>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Enter your name" />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" placeholder="Enter your email" />
              </Form.Group>
              <Form.Group controlId="formMessage">
                <Form.Label>Message</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder="Enter your message" />
              </Form.Group>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default Contact;