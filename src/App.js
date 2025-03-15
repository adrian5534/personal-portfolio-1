import React from 'react';
import NavigationBar from './components/Navbar';
import Bio from './components/Bio';
import Resume from './components/Resume';
import Projects from './components/Projects';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';


function App() {
  return (
    <div className="app">
      <NavigationBar />
      <header className="App-header">
        <h1>Welcome to My Personal Portfolio</h1>
      </header>
      <main>
        <section id="bio">
          <Bio />
        </section>
        <section id="resume">
          <Resume />
        </section>
        <section id="projects">
          <Projects />
        </section>
        <section id="blog">
          <Blog />
        </section>
        <section id="contact">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;