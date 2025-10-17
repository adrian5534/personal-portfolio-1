import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaExternalLinkAlt } from 'react-icons/fa';
import '../styles/projects.css';

function Preview({ url, title }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Fallback if the site blocks iframing
    const t = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setFailed(true);
      }
    }, 3500);
    return () => clearTimeout(t);
  }, [loading]);

  return (
    <div className="preview-wrap">
      {loading && <div className="preview-skeleton" aria-hidden="true" />}
      {!failed && (
        <iframe
          className="preview-frame"
          title={`${title} preview`}
          src={url}
          loading="lazy"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          onLoad={() => {
            setLoading(false);
            setFailed(false);
          }}
        />
      )}
      {failed && (
        <div className="preview-fallback">
          <p>Live preview unavailable here.</p>
          <Button
            size="sm"
            variant="light"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open live demo <FaExternalLinkAlt className="ms-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

const projects = [
  {
    title: 'Bella’s Pizza',
    url: 'https://bellapizzahh.netlify.app',
    summary:
      'A modern, conversion‑focused pizzeria site with a branded hero, promo bar, and menu cards that drive action. Built mobile‑first with smooth navigation and performance‑tuned bundling.',
    highlights: [
      'Off‑canvas mobile navbar and polished footer',
      'Clear “Add to Cart” CTAs and scannable menu layout',
      'Progressive enhancement for older mobile Safari',
    ],
    tech: ['React 19', 'Vite', 'Bootstrap', 'Custom CSS', 'Netlify'],
  },
  {
    title: 'La Vie Gourmet',
    url: 'https://laviegourmet.netlify.app',
    summary:
      'A single‑page restaurant experience with a full menu, filters, and a guided reservation flow. Clean, confident visuals designed to convert diners quickly.',
    highlights: [
      'Interactive reservations with date/time picker + toasts',
      'Confirmation page with manage/cancel actions',
      'Polished, mobile‑first UI with Font Awesome icons',
    ],
    tech: ['React', 'Vite', 'React Router', 'Bootstrap', 'Custom CSS'],
  },
  {
    title: 'Bloom & Co. Account Dashboard',
    url: 'https://bloom-co.netlify.app',
    summary:
      'A brand‑driven e‑commerce account area that mirrors wireframes and ships with accessible, reusable UI patterns and themed design tokens.',
    highlights: [
      'Account tabs: Profile, Addresses, Payments, Orders, Notifications, Security',
      'Saved cards with brand pills, default badge, add‑card form',
      'Subtle motion via Framer Motion; modular CSS per panel',
    ],
    tech: ['React 19', 'Vite', 'React Router 7', 'Bootstrap 5', 'Framer Motion'],
  },
  {
    title: 'Brew Haven Café',
    url: 'https://brewwhavencoffee.netlify.app',
    summary:
      'A friendly café SPA with accessible navigation, fluid typography, and reusable components. Designed to look great on phones first.',
    highlights: [
      'Active routing with cart badge',
      'Clean Menu, About, and Contact pages',
      'ARIA labels, keyboard focus, and color‑contrast care',
    ],
    tech: ['React', 'Vite', 'React Router', 'Bootstrap 5', 'Custom CSS'],
  },
  {
    title: 'The Sharp Look Barbershop',
    url: 'https://thesharplook.netlify.app',
    summary:
      'A polished barbershop app with a smooth 4‑step booking flow, media‑rich gallery, and SEO‑ready metadata for discoverability.',
    highlights: [
      'Booking wizard: service → date/time → barber → confirm',
      'Gallery with filter/search and “Book this Style” CTA',
      'Open Graph, Twitter cards, JSON‑LD schema',
    ],
    tech: ['React 19', 'Vite 7', 'Bootstrap 5', 'Framer Motion', 'React Router 7'],
  },
];

function Projects() {
  return (
    <section id="projects">
      <Container>
        <h2 className="mb-4">Projects</h2>
        <Row>
          {projects.map((p, idx) => (
            <Col md={6} lg={6} key={idx} className="mb-4">
              <Card className="project-card h-100">
                <Preview url={p.url} title={p.title} />
                <Card.Body>
                  <Card.Title className="mb-2">{p.title}</Card.Title>
                  <Card.Text className="project-summary">{p.summary}</Card.Text>

                  <ul className="project-highlights">
                    {p.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>

                  <div className="project-tech">
                    {p.tech.map((t) => (
                      <Badge bg="secondary" key={t} className="me-1 mb-1 tech-chip">
                        {t}
                      </Badge>
                    ))}
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="primary"
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live demo <FaExternalLinkAlt className="ms-1" />
                    </Button>
                    <Button variant="outline-primary" href="#contact">
                      Work with me
                    </Button>
                  </div>
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