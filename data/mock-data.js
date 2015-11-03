const yesterday = new Date(Date.now() - 86400);
const fiveDaysFromNow = new Date(Date.now() + 86400 * 5);

export const users = [
  {
    display_name: "Henrik Joreteg",
    email: "henrik@joreteg.com",
    created_at: new Date(),
    updated_at: new Date(),
    super_user: true,
    json_profile: JSON.stringify({
      bio: "Some JS dev",
      job_title: "JS Developer",
      company_name: "Formidable",
      photo_url: "https://static.joreteg.com/henrik_medium.jpg",
      address_1: "2508 Crane Dr.",
      address_2: "",
      city: "West Richland",
      state: "WA",
      country: "USA",
      twitter: "HenrikJoreteg",
      facebook: "HenrikJoreteg",
      linkedin: "HenrikJoreteg"
    }),
    json_meta: JSON.stringify({})
  },
  {
    display_name: "Dr. Seuss",
    email: "dr@seuss.com",
    created_at: new Date(),
    updated_at: new Date(),
    super_user: false,
    json_profile: JSON.stringify({
      bio: "I do not like green eggs and ham.",
      job_title: "Author",
      company_name: "Whoville Inc.",
      photo_url: "https://placehold.it/150x150",
      address_1: "3 Whoville Street",
      address_2: "",
      city: "Whoville",
      state: "WA",
      country: "USA",
      twitter: "GreenEggsAndHam",
      facebook: "GreenEggsAndHam",
      linkedin: "GreenEggsAndHam"
    }),
    json_meta: JSON.stringify({})
  },
  {
    display_name: "Sam I Am",
    email: "sam@iam.com",
    created_at: new Date(),
    updated_at: new Date(),
    super_user: false,
    json_profile: JSON.stringify({
      bio: "Persistant creature",
      job_title: "Nagging friend",
      company_name: "Whoville Inc.",
      photo_url: "https://placehold.it/150x150",
      address_1: "3 Whoville Street",
      address_2: "",
      city: "Whoville",
      state: "WA",
      country: "USA",
      twitter: "SamIAm",
      facebook: "SamIAm",
      linkedin: "SamIAm"
    }),
    json_meta: JSON.stringify({})
  }
];

export const hackathons = [
  {
    name: "Hack the planet",
    slug: "hack-the-planet",
    description: "Yep, hack the planet!",
    logo_url: "http://example.com/hack.gif",
    start_at: new Date(yesterday),
    end_at: new Date(fiveDaysFromNow),
    contact_name: "Hacker #42",
    contact_email: "hackthe@planet.com",
    created_at: new Date(),
    updated_at: new Date(),
    json_meta: JSON.stringify({})
  },
  {
    name: "Hack the planet, again!",
    slug: "hack-the-planet-again",
    description: "No really, I'm serious... hack the planet!",
    logo_url: "http://example.com/uberhack.gif",
    start_at: new Date(yesterday),
    end_at: new Date(fiveDaysFromNow),
    contact_name: "Evilpacket",
    contact_email: "l337@hackerz.com",
    created_at: new Date(),
    updated_at: new Date(),
    json_meta: JSON.stringify({})
  }
];

export const projects = [
  {
    owner_id: 1,
    hackathon_id: 1,
    title: "Yo!",
    tagline: "Yo your friends.",
    status: "active",
    description: "Yup, that's all there is to it.",
    image_url: "https://placehold.it/150x150",
    code_repo_url: "http://example.com",
    prototype_url: "http://example.com",
    supporting_files_url: "http://example.com/files",
    inspiration: "Why not?!",
    how_it_will_work: "Push a button, send a Yo!",
    needs_hackers: false,
    tags: ["Yo", "Social"].join(","),
    video_id: 47,
    created_at: new Date(),
    updated_at: new Date(),
    json_meta: JSON.stringify({
      is_awesome: true
    })
  },
  {
    owner_id: 2,
    hackathon_id: 1,
    title: "bnews app",
    tagline: "Where the news can be fun",
    status: "active",
    description: "",
    image_url: "https://onehackassets.blob.core.windows.net/images/_processed/af3f1438-f31a-e511-ab0e-00155d5066d7.JPG",
    code_repo_url: "https://onehack2015.azurewebsites.net/project/AF3F1438-F31A-E511-AB0E-00155D5066D7",
    prototype_url: "http://example.com",
    supporting_files_url: "http://example.com/files",
    inspiration: "Realized that news tend to be really boring.",
    how_it_will_work: "Scrape news, make interactive.",
    needs_hackers: false,
    tags: ["Bing", "News", "Bingcubator", "ASGEA"].join(","),
    video_id: 1231,
    created_at: new Date(),
    updated_at: new Date(),
    json_meta: JSON.stringify({})
  }
];

export const members = [
  {
    user_id: 1,
    project_id: 1
  },
  {
    user_id: 2,
    project_id: 1
  }
];

export const comments = [
  {
    body: "Try them and you may, I say.",
    user_id: 1,
    project_id: 1
  },
  {
    body: "Sam, if you will let me be I will try them and you will see.",
    user_id: 1,
    project_id: 1
  }
];

export const participants = [
  {
    user_id: 1,
    hackathon_id: 1
  },
  {
    user_id: 2,
    hackathon_id: 1
  },
  {
    user_id: 3,
    hackathon_id: 1
  },
  {
    user_id: 2,
    hackathon_id: 2
  },
  {
    user_id: 3,
    hackathon_id: 2
  }
];
