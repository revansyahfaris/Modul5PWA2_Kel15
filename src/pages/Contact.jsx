import { MapPin, Clock, Phone } from 'lucide-react'

// Challenge 4 — Contact sekarang menjadi section di halaman Profile.
function Contact() {
  return (
    <section className="profile-section" id="contact">
      <h3 className="section-title"><Phone size={18} /> Contact</h3>
      <p className="section-lede">Come by the shop.</p>
      <ul className="contact-list">
        <li><MapPin size={15} /> 123 Range Road</li>
        <li><Clock size={15} /> Open Tuesday to Saturday, 10 to 6</li>
        <li><Phone size={15} /> (555) 010-0100</li>
      </ul>
    </section>
  )
}

export default Contact
