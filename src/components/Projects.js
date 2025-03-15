import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import portfolioImg from '../images/portfolio.jpg';
import ecommerceImg from '../images/ecommerce.jpg';
import blogImg from '../images/blog.jpg';
import taskImg from '../images/task.jpg';
import weatherImg from '../images/weather.jpg';

function Projects() {
  const projectList = [
    {
      title: 'Personal Portfolio Website',
      description: 'Create a personal portfolio website to showcase your skills, projects, and experience. Include sections for your bio, resume, projects, blog, and contact information.',
      technologies: 'HTML5, CSS3, JavaScript, React, Bootstrap',
      features: 'Responsive design, smooth scrolling, project gallery, contact form',
      githubLink: 'https://github.com/adrianreynolds/personal-portfolio',
      image: portfolioImg
    },
    {
      title: 'E-commerce Website',
      description: 'Develop a fully functional e-commerce website with product listings, a shopping cart, and a checkout process.',
      technologies: 'HTML5, CSS3, JavaScript, React, Node.js, Express, MongoDB',
      features: 'User authentication, product search and filter, payment gateway integration, order management',
      githubLink: 'https://github.com/adrianreynolds/e-commerce-website',
      image: ecommerceImg
    },
    {
      title: 'Blog Platform',
      description: 'Build a blog platform where users can create, edit, and delete posts. Include features for commenting and user authentication.',
      technologies: 'HTML5, CSS3, JavaScript, Vue.js, Node.js, Express, MongoDB',
      features: 'User authentication, rich text editor, comment system, responsive design',
      githubLink: 'https://github.com/adrianreynolds/blog-platform',
      image: blogImg
    },
    {
      title: 'Task Management App',
      description: 'Create a task management application that allows users to create, edit, and delete tasks. Include features for categorizing and prioritizing tasks.',
      technologies: 'HTML5, CSS3, JavaScript, Angular, Node.js, Express, MongoDB',
      features: 'User authentication, drag-and-drop task management, due date reminders, responsive design',
      githubLink: 'https://github.com/adrianreynolds/task-management-app',
      image: taskImg
    },
    {
      title: 'Weather Dashboard',
      description: 'Develop a weather dashboard that displays current weather conditions and forecasts for multiple cities. Include features for searching and saving favorite cities.',
      technologies: 'HTML5, CSS3, JavaScript, React, OpenWeatherMap API',
      features: 'Search functionality, favorite cities, weather icons, responsive design',
      githubLink: 'https://github.com/adrianreynolds/weather-dashboard',
      image: weatherImg
    }
  ];

  return (
    <section id="projects">
      <Container>
        <h2>Projects</h2>
        <Row>
          {projectList.map((project, index) => (
            <Col md={6} key={index} className="mb-4">
              <Card className="h-100">
                <Card.Img variant="top" src={project.image} />
                <Card.Body>
                  <Card.Title>{project.title}</Card.Title>
                  <Card.Text>
                    <strong>Description:</strong> {project.description}
                  </Card.Text>
                  <Card.Text>
                    <strong>Technologies:</strong> {project.technologies}
                  </Card.Text>
                  <Card.Text>
                    <strong>Features:</strong> {project.features}
                  </Card.Text>
                  <Button variant="primary" href={project.githubLink} target="_blank">
                    View on GitHub
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default Projects;