const SITE_URL = "https://www.thefineartist.org";

// Structured data: tells Google exactly who TFA is, what its name variations
// are, and where its official pages live.
const data = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "The Fine Artist Community",
      alternateName: ["TFA", "The Fine Artist", "The Fine Artist Community (TFA)"],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/opengraph-image.png`,
      description:
        "The Fine Artist Community (TFA) is an art community in Nigeria where artists of every level belong, learn, exhibit and grow together.",
      slogan: "Home of creative inclusiveness",
      foundingDate: "2023",
      founder: { "@type": "Person", name: "Olayinka Judah" },
      areaServed: { "@type": "Country", name: "Nigeria" },
      knowsAbout: ["Fine art", "Art education", "Art exhibitions", "Artist community"],
      sameAs: [
        "https://instagram.com/thefineartistig",
        "https://facebook.com/thefineartistfacebook",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "The Fine Artist Community (TFA)",
      alternateName: ["TFA", "The Fine Artist", "The Fine Artist Community"],
      inLanguage: "en-NG",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
