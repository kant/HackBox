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

export const projects = [
  {
    id: 1,
    title: "bnews app",
    tagline: "Where the news can be fun",
    description: "",
    owner: "Justin Ting",
    owner_email: "justtin@microsoft.com",
    owner_alias: "justtin",
    url: "https: //onehack2015.azurewebsites.net/project/AF3F1438-F31A-E511-AB0E-00155D5066D7",
    team_members: null,
    team_size: null,
    venue: "China - Beijing Hack Venue",
    keywords: "Bing,News,Bingcubator,ASGEA,STCADesignTeam,CrazyLab,BeijingSF",
    project_image: "https: //onehackassets.blob.core.windows.net/images/_processed/af3f1438-f31a-e511-ab0e-00155d5066d7.JPG",
    num_likes: 12,
    num_shares: 0,
    num_comments: 0,
    num_views: 211,
    num_videoviews: 122,
    num_uniques: 89,
    num_uniqueviews: 89,
  },
];
