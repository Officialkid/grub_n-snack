'use client'

import Link from 'next/link'
import LandingNav from '@/components/LandingNav'
import LandingFooter from '@/components/LandingFooter'

function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
      style={{
        background:
          'linear-gradient(rgba(36,42,65,0.88), rgba(36,42,65,0.88)), url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1350&q=80) center/cover no-repeat',
      }}
    >
      <div className="relative z-10 text-center max-w-3xl mx-auto px-4 space-y-6">
        <h1
          className="text-5xl md:text-6xl font-extrabold leading-tight"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Savour Every Bite
        </h1>
        <h2
          className="text-2xl md:text-3xl font-light"
          style={{ color: '#e3720d' }}
        >
          Save every moment
        </h2>
        <p className="text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
          Providing Students with Quality and Affordable Prices they will Love.
          Your ultimate food delivery companion, tailored for university
          students seeking convenience and affordability.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/order"
            className="px-8 py-3.5 rounded-full font-bold text-white text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ backgroundColor: '#e3720d' }}
          >
            Order Now
          </Link>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault()
              document
                .querySelector('#about')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="px-8 py-3.5 rounded-full font-bold text-lg border-2 transition-all duration-300 hover:-translate-y-1"
            style={{
              borderColor: 'rgba(255,255,255,0.6)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <SectionTitle title="About Us" />
        <div className="grid md:grid-cols-2 gap-12 items-center mt-12">
          <div className="space-y-6">
            <p className="text-gray-600 leading-relaxed">
              Grub N Snack was born out of a vision to revolutionize food
              delivery for university students in Kenya. Understanding the need
              for affordable, reliable, and student-friendly options, we created
              a platform that bridges the gap between students and local food
              vendors.
            </p>
            <div className="space-y-3">
              {[
                {
                  title: 'Our Mission',
                  body: 'To revolutionize the dining experience for university students by providing a user-friendly, reliable, and affordable platform that connects them with local vendors.',
                },
                {
                  title: 'Our Vision',
                  body: 'To become the premier food delivery platform for university students in Kenya, expanding to serve diverse customer needs across the region.',
                },
                {
                  title: 'Our Story',
                  body: 'Founded in 2025, Grub N Snack emerged from the realization that university students needed a more convenient, affordable, and reliable food delivery service.',
                },
              ].map((item) => (
                <Accordion key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </div>
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ transform: 'perspective(1000px) rotateY(-3deg)' }}
          >
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80"
              alt="Delicious food"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Accordion({ title, body }: { title: string; body: string }) {
  return (
    <details className="rounded-xl overflow-hidden group">
      <summary
        className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-white list-none"
        style={{ backgroundColor: '#242a41' }}
      >
        {title}
        <span className="ml-2 transition-transform group-open:rotate-180 text-lg">
          ▾
        </span>
      </summary>
      <div className="px-5 py-4 bg-white border border-gray-100 text-gray-600 text-sm leading-relaxed">
        {body}
      </div>
    </details>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: '🏷️',
      title: 'Affordable Pricing',
      body: 'Designed specifically for students with budget-friendly options and special discounts.',
    },
    {
      icon: '🤝',
      title: 'Trusted Partnerships',
      body: 'Strong partnerships with trusted local vendors ensuring quality and variety.',
    },
    {
      icon: '🚀',
      title: 'Fast & Reliable',
      body: 'Quick and reliable deliveries wherever you are on campus or surrounding areas.',
    },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <SectionTitle title="Why Choose Us?" />
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-50 rounded-2xl p-8 text-center border-t-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              style={{ borderColor: '#e3720d' }}
            >
              <div
                className="text-4xl mb-5 inline-flex items-center justify-center w-16 h-16 rounded-full"
                style={{ backgroundColor: 'rgba(227,114,13,0.1)' }}
              >
                {f.icon}
              </div>
              <h3
                className="text-lg font-bold mb-3"
                style={{ color: '#242a41' }}
              >
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LocationsSection() {
  const locations = [
    { icon: '🎓', name: 'UON Main Campus', desc: 'Lower Kabete Road — full campus coverage' },
    { icon: '🔬', name: 'Chiromo Campus', desc: 'Riverside Drive — all faculties' },
    { icon: '⚙️', name: 'Faculty of Engineering', desc: 'Engineering Block delivery points' },
    { icon: '🏠', name: 'UON Environs', desc: 'Surrounding areas and student residences' },
    { icon: '🏨', name: 'Hotels & YMCA', desc: 'Accommodation areas in the vicinity' },
  ]

  return (
    <section
      id="locations"
      className="py-20"
      style={{ backgroundColor: '#f8f9fa' }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <SectionTitle title="Delivery Locations" />
        <p className="text-center text-gray-500 mb-12">
          Our delivery services cover these locations
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div
              key={loc.name}
              className="bg-white rounded-2xl p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="text-4xl mb-4">{loc.icon}</div>
              <h3
                className="font-bold text-base mb-2"
                style={{ color: '#242a41' }}
              >
                {loc.name}
              </h3>
              <p className="text-gray-500 text-sm">{loc.desc}</p>
            </div>
          ))}
          <div
            className="rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-4"
            style={{
              background: 'linear-gradient(135deg, #e3720d, #ff8c3a)',
              color: 'white',
            }}
          >
            <div className="text-4xl">🛒</div>
            <h3 className="font-bold text-lg text-white">Ready to Order?</h3>
            <p className="text-white/90 text-sm">
              Choose your location and place your order now!
            </p>
            <Link
              href="/order"
              className="px-6 py-2.5 bg-white font-bold rounded-full text-sm transition-colors hover:bg-gray-100"
              style={{ color: '#e3720d' }}
            >
              Place Your Order
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <SectionTitle title="Let's Connect!" />
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
          We'd love to hear from you. Whether you have questions, feedback, or
          simply want to partner with us, don't hesitate to reach out.
        </p>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h3 className="font-bold text-lg" style={{ color: '#242a41' }}>
              Contact Information
            </h3>
            {[
              { icon: '📞', text: '+254-748899084' },
              { icon: '✉️', text: 'grubnsnack@gmail.com' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:translate-x-1"
                style={{ backgroundColor: '#f8f9fa' }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-gray-700 text-sm">{item.text}</span>
              </div>
            ))}
            <a
              href="https://whatsapp.com/channel/0029Vb6LCJeGZNCsEI7ggQ39"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white text-sm mt-2 transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: '#25D366' }}
            >
              💬 Join WhatsApp Channel
            </a>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert('Thank you for your message! We will get back to you soon.')
              ;(e.target as HTMLFormElement).reset()
            }}
            className="space-y-4"
          >
            {['Your Name', 'Your Email', 'Your Phone'].map((placeholder) => (
              <input
                key={placeholder}
                type="text"
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                onFocus={(e) => (e.target.style.borderColor = '#e3720d')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            ))}
            <textarea
              rows={4}
              placeholder="Your Message"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
              onFocus={(e) => (e.target.style.borderColor = '#e3720d')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
            <button
              type="submit"
              className="w-full py-3 rounded-full font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: '#e3720d' }}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="text-center">
      <h2
        className="text-3xl md:text-4xl font-extrabold"
        style={{ color: '#242a41', fontFamily: 'Montserrat, sans-serif' }}
      >
        {title}
      </h2>
      <div
        className="w-20 h-1 mx-auto mt-4 rounded-full"
        style={{ backgroundColor: '#e3720d' }}
      />
    </div>
  )
}

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <LocationsSection />
      <ContactSection />
      <LandingFooter />
    </>
  )
}
