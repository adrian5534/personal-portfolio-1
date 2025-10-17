import React from 'react';
import AnimatedSection from '../components/AnimatedSection';
import Stagger from '../components/Stagger';
import Parallax from '../components/Parallax';
import Bio from '../components/Bio';
import Resume from '../components/Resume';
import Projects from '../components/Projects';
import Pricing from '../components/Pricing';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <>
      <Parallax amount={30} scale={[0.98, 1]}>
        <AnimatedSection as="header" className="App-header" variant="scaleIn" stagger={0.06}>
          <Stagger>
            <h1>Welcome to My Personal Portfolio</h1>
          </Stagger>
        </AnimatedSection>
      </Parallax>

      <AnimatedSection id="bio" variant="fadeUp" distance={28} delay={0.05}>
        <Parallax amount={18}>
          <Bio />
        </Parallax>
      </AnimatedSection>

      <AnimatedSection id="resume" variant="slideLeft" distance={36} delay={0.1}>
        <Parallax amount={16}>
          <Resume />
        </Parallax>
      </AnimatedSection>

      <AnimatedSection id="projects" variant="slideRight" distance={36} delay={0.15}>
        <Parallax amount={16}>
          <Projects />
        </Parallax>
      </AnimatedSection>

      <AnimatedSection id="pricing" variant="fade" delay={0.2} stagger={0.07}>
        <Parallax amount={14}>
          <Pricing />
        </Parallax>
      </AnimatedSection>

      <AnimatedSection id="contact" variant="rotateIn" distance={24} delay={0.25}>
        <Parallax amount={12}>
          <Contact />
        </Parallax>
      </AnimatedSection>
    </>
  );
}