const yesterday = new Date(Date.now() - 86400);
const fiveDaysFromNow = new Date(Date.now() + 86400 * 5);

export const hackathons = [
  {
    id: 1,
    name: "Hack the planet",
    start_date: new Date(yesterday),
    end_date: new Date(fiveDaysFromNow),
    num_participants: 13539,
    num_cities: 165,
    num_countries: 82,
    num_first_timers: 8902,
    num_unique_skills: 3417,
    num_projects: 3395,
    num_open_projects: 1894
  },
  {
    id: 2,
    name: "Hack the planet, again!",
    start_date: new Date(yesterday),
    end_date: new Date(fiveDaysFromNow),
    num_participants: 105,
    num_cities: 25,
    num_countries: 8,
    num_first_timers: 23,
    num_unique_skills: 100,
    num_projects: 78,
    num_open_projects: 73
  }
];

export const projects = [
  {
    id: 1,
    owner_id: 47,
    venue_id: 23,
    video_id: 1231,
    title: "bnews app",
    tagline: "Where the news can be fun",
    status: "active",
    description: "",
    image_url: "https: //onehackassets.blob.core.windows.net/images/_processed/af3f1438-f31a-e511-ab0e-00155d5066d7.JPG",
    code_repo_url: "https: //onehack2015.azurewebsites.net/project/AF3F1438-F31A-E511-AB0E-00155D5066D7",
    prototype_url: "http://example.com",
    supporting_files_url: "http://example.com/files",
    inspiration: "Realized that news tend to be really boring.",
    how_it_will_work: "Scrape news, make interactive.",
    needs_hackers: false,
    tags: ["Bing", "News", "Bingcubator", "ASGEA"]
  }
];
