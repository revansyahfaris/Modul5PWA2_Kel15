import { Info } from 'lucide-react'

// Challenge 4 — About sekarang menjadi section di halaman Profile.
function About() {
  return (
    <section className="profile-section" id="about">
      <h3 className="section-title"><Info size={18} /> About</h3>
      <p className="section-lede">A one-room armory.</p>
      <p className="muted">
        Bore &amp; Barrel sells a short, honest list of firearms. Each piece is priced
        from the bench — no markup theatre, no filler.
      </p>
    </section>
  )
}

export default About
