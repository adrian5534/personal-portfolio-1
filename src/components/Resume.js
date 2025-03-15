import React from 'react';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';

function Resume() {
  return (
    <section id="resume">
      <Container>
        <h2>Resume</h2>
        <Row>
          <Col md={6}>
            <h3>Work Experience</h3>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h5>Freelance Web Developer</h5>
                <p>Self-employed</p>
                <p>January 2018 - Present</p>
                <ul>
                  <li>Transformed complex layout PSDs into pixel-perfect HTML5/CSS3 templates.</li>
                  <li>Created responsive website designs ensuring cross-browser compatibility.</li>
                  <li>Built and customized websites using WordPress, including plugin and theme development.</li>
                  <li>Worked with design tools to create web-optimized images.</li>
                  <li>Managed multiple projects simultaneously, delivering high-quality work under tight deadlines.</li>
                </ul>
              </ListGroup.Item>
              <ListGroup.Item>
                <h5>Frontend Developer</h5>
                <p>YSB Academy LLC</p>
                <p>June 2024 - December 2024</p>
                <ul>
                  <li>Developed and maintained the front end functionality of websites.</li>
                  <li>Participated in the design and development of web applications.</li>
                  <li>Collaborated with designers to create clean interfaces and simple, intuitive interactions and experiences.</li>
                  <li>Optimized websites for maximum speed and scalability.</li>
                </ul>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={6}>
            <h3>Education</h3>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h5>High School Diploma</h5>
                <p>Norman Manley High School</p>
                <p>Graduated 2014</p>
              </ListGroup.Item>
            </ListGroup>
            <h3>Skills</h3>
            <ListGroup variant="flush">
              <ListGroup.Item>HTML5, CSS3, JavaScript, jQuery, Bootstrap, Media Queries</ListGroup.Item>
              <ListGroup.Item>JavaScript, Python, Node.js, TypeScript</ListGroup.Item>
              <ListGroup.Item>React, Vue.js, Angular</ListGroup.Item>
              <ListGroup.Item>RESTful/GraphQL APIs, Full-stack design and development</ListGroup.Item>
              <ListGroup.Item>Git, GitHub, Visual Studio Code</ListGroup.Item>
              <ListGroup.Item>Excellent written and spoken English, attention to detail, highly organized, positive attitude, quick learner</ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default Resume;