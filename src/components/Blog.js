import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import reactHooksImg from '../images/react-hooks.png';
import restfulApiImg from '../images/nodejs.jpeg';
import cssGridFlexboxImg from '../images/flexbox.png';
import typescriptImg from '../images/typescript.png';
import webPerformanceImg from '../images/owp.png';

function Blog() {
  const blogPosts = [
    {
      title: 'Understanding React Hooks',
      description: 'An in-depth look at React Hooks and how they can be used to manage state and side effects in functional components.',
      link: 'https://yourblog.com/understanding-react-hooks',
      image: reactHooksImg
    },
    {
      title: 'Building a RESTful API with Node.js',
      description: 'A step-by-step guide to building a RESTful API using Node.js, Express, and MongoDB.',
      link: 'https://yourblog.com/building-a-restful-api-with-nodejs',
      image: restfulApiImg
    },
    {
      title: 'CSS Grid vs. Flexbox: When to Use Which',
      description: 'A comparison of CSS Grid and Flexbox, and guidelines on when to use each layout technique.',
      link: 'https://yourblog.com/css-grid-vs-flexbox',
      image: cssGridFlexboxImg
    },
    {
      title: 'Getting Started with TypeScript',
      description: 'An introduction to TypeScript, its benefits, and how to get started with it in your JavaScript projects.',
      link: 'https://yourblog.com/getting-started-with-typescript',
      image: typescriptImg
    },
    {
      title: 'Optimizing Web Performance',
      description: 'Tips and techniques for optimizing the performance of your web applications.',
      link: 'https://yourblog.com/optimizing-web-performance',
      image: webPerformanceImg
    }
  ];

  return (
    <section id="blog">
      <Container>
        <h2>Blog</h2>
        <Row>
          {blogPosts.map((post, index) => (
            <Col md={6} key={index} className="mb-4">
              <Card className="h-100">
                <Card.Img variant="top" src={post.image} />
                <Card.Body>
                  <Card.Title>{post.title}</Card.Title>
                  <Card.Text>{post.description}</Card.Text>
                  <Button variant="primary" href={post.link} target="_blank">
                    Read More
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

export default Blog;