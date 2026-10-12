import Photo from "./Photo";

// To add a real photo to a row, add:  image: "/images/story/your-file.jpg"
const upcoming: { tag: string; title: string; text: string; image?: string }[] = [
  { tag: "2026", title: "Online practical workshop", text: "Another hands-on session for our members." },
  { tag: "Planned", title: "Free art studio", text: "A free place to work for artists in Ondo." },
  { tag: "Members", title: "Cheaper art materials", text: "Art materials at lower prices for TFA members." },
  { tag: "2027", title: "Artist meets", text: "In-person gatherings for artists to connect." },
  { tag: "2027", title: "TFA exhibition", text: "A public showcase of our members work." },
];

export default function Upcoming() {
  return (
    <section id="next" className="bg-crimson-deep px-6 py-14 text-cream md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow text-blush">What comes next</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
          Where we are headed.
        </h2>

        <ul data-stagger className="mt-6 md:mt-12 md:grid md:grid-cols-2 md:gap-x-16">
          {upcoming.map((u) => (
            <li
              key={u.title}
              className="flex items-center gap-4 border-b border-paper/25 py-4"
            >
              <Photo
                src={u.image}
                alt={u.title}
                tone="dark"
                sizes="72px"
                className="size-[72px] shrink-0 rounded-[20px] !p-0"
              />
              <div>
                <p className="eyebrow text-blush">{u.tag}</p>
                <h3 className="mt-1 text-xl font-bold leading-tight">{u.title}</h3>
                <p className="mt-1 text-sm text-cream/75">{u.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
