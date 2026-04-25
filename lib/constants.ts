export type EventItem = {
  image: string;
  title: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}


export const events: EventItem[] = [
  {
    title: "React Summit 2026",
    image: "/images/event1.png",
    slug: "react-summit-2026",
    location: "Amsterdam, Netherlands",
    date: "Jun 13, 2026",
    time: "9:00 AM - 6:00 PM",
  },
  {
    title: "Next.js Conf",
    image: "/images/event2.png",
    slug: "nextjs-conf",
    location: "San Francisco, CA",
    date: "Oct 22, 2026",
    time: "10:00 AM - 5:00 PM",
  },
  {
    title: "Google I/O Connect",
    image: "/images/event3.png",
    slug: "google-io-connect-2026",
    location: "Mountain View, CA",
    date: "May 20, 2026",
    time: "10:00 AM - 7:00 PM",
  },
  {
    title: "HackMIT 2026",
    image: "/images/event4.png",
    slug: "hackmit-2026",
    location: "Cambridge, MA",
    date: "Sep 14, 2026",
    time: "12:00 PM - 12:00 PM",
  },
  {
    title: "Node Congress",
    image: "/images/event5.png",
    slug: "node-congress-2026",
    location: "Berlin, Germany",
    date: "Apr 14, 2026",
    time: "9:30 AM - 5:30 PM",
  },
  {
    title: "AWS re:Invent",
    image: "/images/event6.png",
    slug: "aws-reinvent-2026",
    location: "Las Vegas, NV",
    date: "Nov 30, 2026",
    time: "8:00 AM - 6:00 PM",
  },
];
