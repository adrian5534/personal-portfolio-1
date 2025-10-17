import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import profilePic from '../images/profile-pic.webp';

function Bio() {
  return (
    <section id="bio">
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="text-center">
            <Image src={profilePic} roundedCircle fluid />
          </Col>
          <Col md={8}>
            <h2>Bio</h2>
            <p>Hello! I'm Adrian Reynolds, a passionate and experienced Frontend Developer with over 15 years of hands-on experience in HTML5, CSS3, JavaScript, and various web development frameworks. I enjoy creating responsive and visually appealing websites.</p>
            <p>Throughout my career, I have worked on numerous projects, transforming complex layout PSDs into pixel-perfect HTML5/CSS3 templates, creating responsive website designs, and building and customizing websites using WordPress. My proficiency in jQuery, Bootstrap, and media queries, along with my ability to manage multiple projects simultaneously, has allowed me to deliver high-quality work under tight deadlines.</p>
            <p>I am excited to continue growing professionally and contribute my skills to dynamic teams and innovative projects.</p>
            <p>In my free time, I enjoy exploring new technologies, contributing to open-source projects, and staying active through outdoor activities.</p>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default Bio;