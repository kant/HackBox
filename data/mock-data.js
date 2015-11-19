import sample from "lodash.sample";
import faker from "faker";

const yesterday = new Date(Date.now() - 86400);
const fiveDaysFromNow = new Date(Date.now() + 86400 * 5);

let count;

export const users = [
  {
    id: "9e4b5ba4-03e4-42ab-b4b3-04af1b4b6c70",
    name: "Henrik Joreteg",
    email: "henrik@joreteg.com",
    family_name: "Joreteg",
    given_name: "Henrik",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
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
    id: "4828fcc9-3272-45e4-96a9-0c79d152fd82",
    name: "Dr. Seuss",
    family_name: "Seuss",
    given_name: "Dr.",
    email: "dr@seuss.com",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
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
    id: "8e7f4eca-921c-47f8-905e-d417c0eb78a8",
    name: "Sam I Am",
    family_name: "I Am",
    given_name: "Sam",
    email: "sam@iam.com",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
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

count = 50;
while (count--) {
  const name = faker.name.findName();
  users.push(Object.assign({}, users[2], {
    id: faker.random.uuid(),
    name,
    family_name: name.split(" ")[1],
    given_name: name.split(" ")[0],
    email: faker.internet.email(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    super_user: false,
    json_profile: JSON.stringify({
      bio: faker.name.jobTitle(),
      job_title: faker.name.jobTitle(),
      company_name: faker.company.companyName(),
      photo_url: faker.image.avatar(),
      address_1: faker.address.streetName(),
      address_2: faker.address.secondaryAddress(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      country: faker.address.country(),
      twitter: faker.internet.userName(),
      facebook: faker.internet.userName(),
      linkedin: faker.internet.userName()
    }),
    json_meta: JSON.stringify({})
  }));
}


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
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
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
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    json_meta: JSON.stringify({})
  }
];


export const projects = [
  {
    owner_id: users[0].id,
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
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    json_meta: JSON.stringify({
      is_awesome: true
    })
  },
  {
    owner_id: users[0].id,
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
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    json_meta: JSON.stringify({})
  }
];

const tagset = ["Office", "News", "Bingcubator", "Azure", "Edge", "Windows 10"];
count = 50;
while (count--) {
  projects.push(Object.assign({}, projects[1], {
    owner_id: users[0].id,
    hackathon_id: 2,
    title: faker.name.title(),
    description: faker.lorem.paragraphs(),
    tagline: faker.company.catchPhrase(),
    inspiration: faker.lorem.paragraph(),
    how_it_will_work: faker.lorem.paragraph(),
    needs_hackers: count % 2 === 0,
    tags: sample(tagset, 3).join(),
    video_id: count,
    created_at: faker.date.recent(),
    updated_at: faker.date.recent()
  }));
}

export const members = [
  {
    user_id: users[0].id,
    project_id: 1
  },
  {
    user_id: users[1].id,
    project_id: 1
  }
];

export const comments = [
  {
    body: "Try them and you may, I say.",
    user_id: users[0].id,
    project_id: 1
  },
  {
    body: "Sam, if you will let me be I will try them and you will see.",
    user_id: users[0].id,
    project_id: 1
  }
];

export const participants = [
  {
    user_id: users[0].id,
    hackathon_id: 1
  },
  {
    user_id: users[1].id,
    hackathon_id: 1
  },
  {
    user_id: users[2].id,
    hackathon_id: 1
  },
  {
    user_id: users[1].id,
    hackathon_id: 2
  },
  {
    user_id: users[2].id,
    hackathon_id: 2
  }
];
