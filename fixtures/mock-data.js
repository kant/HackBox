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
    num_open_projects: 1894,
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
    num_open_projects: 73,
  },
];
