import React from 'react';
import Bio from '../components/Bio';
import Resume from '../components/Resume';
import Projects from '../components/Projects';
import Pricing from '../components/Pricing';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <>
      <header className="App-header">
        <h1>Welcome to My Personal Portfolio</h1>
      </header>

      <section id="bio">
        <Bio />
      </section>

      <section id="resume">
        <Resume />
      </section>

      <section id="projects">
        <Projects />
      </section>

      <section id="pricing">
        <Pricing />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </>
  );
}