import sample from "lodash.sample";
import faker from "faker";
import { participantTypes, customerTypes, productTypes } from "./fixed-data";

const daysAgo = (numDays) => new Date(Date.now() - 86400 * numDays);
const daysFromNow = (numDays) => new Date(Date.now() + 86400 * numDays);

let count;

export const users = [
  {
    id: "9e4b5ba4-03e4-42ab-b4b3-04af1b4b6c70",
    name: "Henrik Joreteg",
    email: "hjoreteg@gmail.com",
    family_name: "Joreteg",
    given_name: "Henrik",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    bio: "Some JS dev",
    json_expertise: JSON.stringify(["JSstuff"]),
    primary_role: "Developer",
    product_focus: "Office",
    country: "United States",
    json_working_on: JSON.stringify(["progressive web apps"]),
    json_profile: JSON.stringify({
      job_title: "JS Developer",
      company_name: "Formidable",
      photo_url: "https://static.joreteg.com/henrik_medium.jpg",
      address_1: "2508 Crane Dr.",
      address_2: "",
      twitter: "HenrikJoreteg",
      facebook: "HenrikJoreteg",
      linkedin: "HenrikJoreteg"
    }),
    json_interests: JSON.stringify([]),
    json_meta: JSON.stringify({}),
    profession: "Developer",
    discipline: "Software",
    city: "Seattle",
    alias: "HJ",
    job_title: "JS Developer",
    department: "Internet"
  },
  {
    id: "4828fcc9-3272-45e4-96a9-0c79d152fd82",
    name: "Dr. Seuss",
    family_name: "Seuss",
    given_name: "Dr.",
    email: "dr@seuss.com",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    json_expertise: JSON.stringify(["KidsBooks", "Fish"]),
    primary_role: "Developer",
    product_focus: "Devices",
    country: "India",
    json_working_on: JSON.stringify(["writing", "building"]),
    bio: "I do not like green eggs and ham.",
    json_profile: JSON.stringify({
      job_title: "Author",
      company_name: "Whoville Inc.",
      photo_url: "https://placehold.it/150x150",
      address_1: "3 Whoville Street",
      address_2: "",
      twitter: "GreenEggsAndHam",
      facebook: "GreenEggsAndHam",
      linkedin: "GreenEggsAndHam"
    }),
    json_interests: JSON.stringify(["cycling"]),
    json_meta: JSON.stringify({}),
    profession: "Developer",
    discipline: "Software",
    city: "Seattle",
    alias: "DS",
    job_title: "Author",
    department: "Poems, Gnomes & Homes"
  },
  {
    id: "8e7f4eca-921c-47f8-905e-d417c0eb78a8",
    name: "Sam I Am",
    family_name: "I Am",
    given_name: "Sam",
    email: "sam@iam.com",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    json_expertise: JSON.stringify(["persistance", "persuasion"]),
    primary_role: "Marketing",
    product_focus: "Windows",
    country: "United States",
    json_working_on: JSON.stringify(["convincing cats", "eating green eggs"]),
    bio: "Persistant creature",
    json_profile: JSON.stringify({
      job_title: "Nagging friend",
      company_name: "Whoville Inc.",
      photo_url: "https://placehold.it/150x150",
      address_1: "3 Whoville Street",
      address_2: "",
      twitter: "SamIAm",
      facebook: "SamIAm",
      linkedin: "SamIAm"
    }),
    json_interests: JSON.stringify([]),
    json_meta: JSON.stringify({}),
    profession: "Developer",
    discipline: "Software",
    city: "Seattle",
    alias: "SIA",
    job_title: "Nagging friend",
    department: "Cuisine"
  },
  {
    id: "76se6caa-921c-47f8-905e-d417c0eb78a8",
    name: "Fishy",
    family_name: "Fillet",
    given_name: "Fisherton",
    email: "f.ish@fishes.com",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    json_expertise: JSON.stringify(["swimming"]),
    primary_role: "Marketing",
    product_focus: "Windows",
    country: "United States",
    json_working_on: JSON.stringify(["Swimming", "eating"]),
    bio: "Blub, blub, blub",
    json_profile: JSON.stringify({
      job_title: "Official Fish",
      company_name: "Ocean Inc.",
      photo_url: "https://placehold.it/150x150",
      address_1: "4 Ocean Street",
      address_2: "",
      twitter: "fishy",
      facebook: "fishy",
      linkedin: "fishy"
    }),
    json_interests: JSON.stringify([]),
    json_meta: JSON.stringify({}),
    profession: "Developer",
    discipline: "Software",
    city: "Seattle",
    alias: "F",
    job_title: "Official Fish",
    department: "Long John Silvers"
  }
];

count = 50;
const dynamicallyGeneratedUsers = [];
while (count--) {
  const name = faker.name.findName();
  const user = Object.assign({}, users[2], {
    id: faker.random.uuid(),
    name,
    family_name: name.split(" ")[1],
    given_name: name.split(" ")[0],
    email: faker.internet.email(),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    json_expertise: "[]",
    primary_role: sample(participantTypes),
    product_focus: sample(productTypes),
    json_working_on: "[]",
    json_profile: JSON.stringify({
      bio: faker.name.jobTitle(),
      job_title: faker.name.jobTitle(),
      company_name: faker.company.companyName(),
      photo_url: faker.image.avatar(),
      address_1: faker.address.streetName(),
      address_2: faker.address.secondaryAddress(),
      twitter: faker.internet.userName(),
      facebook: faker.internet.userName(),
      linkedin: faker.internet.userName()
    }),
    json_meta: JSON.stringify({})
  });
  users.push(user);
  dynamicallyGeneratedUsers.push(user);
}

// fake decoded credentials
// used for testing route
export const credentials = {
  "super": {
    "aud": faker.random.uuid(),
    "iss": "https://sts.windows.net/6fb02a07-5389-40d4-9f03-c87f94c07ec0/",
    "iat": Date.now(),
    "nbf": Date.now(),
    "exp": Date.now(),
    "amr": [
      "pwd"
    ],
    "email": users[0].email,
    "family_name": users[0].family_name,
    "given_name": users[0].given_name,
    "idp": "live.com",
    "name": users[0].name,
    "nonce": faker.random.uuid(),
    "oid": users[0].id,
    "roles": [
      "admin"
    ],
    "sub": faker.random.uuid(),
    "tid": faker.random.uuid(),
    "unique_name": `live.com#${users[0].email}`,
    "ver": "1.0",
    "token": faker.random.uuid()
  },
  "regular": {
    "aud": faker.random.uuid(),
    "iss": "https://sts.windows.net/6fb02a07-5389-40d4-9f03-c87f94c07ec0/",
    "iat": Date.now(),
    "nbf": Date.now(),
    "exp": Date.now(),
    "amr": [
      "pwd"
    ],
    "email": users[1].email,
    "family_name": users[1].family_name,
    "given_name": users[1].given_name,
    "idp": "live.com",
    "name": users[1].name,
    "nonce": faker.random.uuid(),
    "oid": users[1].id,
    "roles": [],
    "sub": faker.random.uuid(),
    "tid": faker.random.uuid(),
    "unique_name": `live.com#${users[1].email}`,
    "ver": "1.0",
    "token": faker.random.uuid()
  },
  "regular2": {
    "aud": faker.random.uuid(),
    "iss": "https://sts.windows.net/6fb02a07-5389-40d4-9f03-c87f94c07ec0/",
    "iat": Date.now(),
    "nbf": Date.now(),
    "exp": Date.now(),
    "amr": [
      "pwd"
    ],
    "email": users[2].email,
    "family_name": users[2].family_name,
    "given_name": users[2].given_name,
    "idp": "live.com",
    "name": users[2].name,
    "nonce": faker.random.uuid(),
    "oid": users[2].id,
    "roles": [],
    "sub": faker.random.uuid(),
    "tid": faker.random.uuid(),
    "unique_name": `live.com#${users[2].email}`,
    "ver": "1.0",
    "token": faker.random.uuid()
  }
};

export const hackathons = [
  {
    name: "First Annual hack the planet",
    slug: "inaugural-hack-the-planet",
    tagline: "Because the planet needs hacking",
    description: "Yep, hack the planet!",
    logo_url: "http://example.com/hack.gif",
    start_at: daysAgo(1),
    end_at: daysFromNow(5),
    org: "Hackers Inc.",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    city: "Redmond",
    country: "United States",
    color_scheme: "Azure blue",
    json_meta: JSON.stringify({}),
    is_published: true,
    is_public: true
  },
  {
    name: "Hack the planet, part two!",
    slug: "hack-the-planet-again",
    tagline: "Hacking still needed",
    description: "No really, I'm serious... hack the planet!",
    logo_url: "http://example.com/uberhack.gif",
    start_at: daysAgo(2),
    end_at: daysFromNow(4),
    org: "Hackers LLC",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    city: "Mumbai",
    country: "India",
    color_scheme: "Xbox green",
    json_meta: JSON.stringify({}),
    is_published: false,
    is_public: false
  },
  {
    name: "Happy hack",
    slug: "happy-hacker-gonna-hack",
    tagline: "Smiling hackers",
    description: "It's gonna be fun!",
    logo_url: "http://example.com/happyhack.gif",
    start_at: daysAgo(3),
    end_at: daysFromNow(3),
    org: "Hackers LLC",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    city: "Mumbai",
    country: "India",
    color_scheme: "Xbox green",
    json_meta: JSON.stringify({}),
    is_published: true,
    is_public: true
  },
  {
    name: "Ongoing hack",
    slug: "ongoing-hack",
    tagline: "It keeps on going",
    description: "Hacking is forever",
    logo_url: "http://example.com/hack.gif",
    start_at: daysAgo(1),
    org: "Hackers LLC",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    city: "Seattle",
    country: "United States",
    color_scheme: "Xbox green",
    json_meta: JSON.stringify({}),
    is_published: true,
    is_public: true
  },
  {
    name: "Not started hack",
    slug: "not-started-hack",
    tagline: "I'll start eventually",
    description: "Now isn't the time",
    logo_url: "http://example.com/hack.gif",
    start_at: daysFromNow(10),
    end_at: daysFromNow(20),
    org: "Hackers LLC",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    city: "Seattle",
    country: "United States",
    color_scheme: "Xbox green",
    json_meta: JSON.stringify({}),
    is_published: true,
    is_public: true
  },
  {
    name: "Completed hack",
    slug: "completed-hack",
    tagline: "It happened",
    description: "It was great",
    logo_url: "http://example.com/hack.gif",
    start_at: daysAgo(10),
    end_at: daysAgo(1),
    org: "Hackers LLC",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    city: "Seattle",
    country: "United States",
    color_scheme: "Xbox green",
    json_meta: JSON.stringify({}),
    is_published: true,
    is_public: true
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
    needs_hackers: true,
    writing_code: true,
    existing: true,
    external_customers: true,
    needed_role: "Developer",
    product_focus: productTypes[0],
    json_needed_expertise: JSON.stringify(["bostaff", "nunchuck"]),
    customer_type: "Consumers",
    json_tags: JSON.stringify(["Yo", "Social"]),
    video_id: 47,
    created_at: daysAgo(2),
    updated_at: faker.date.recent(),
    json_meta: JSON.stringify({
      is_awesome: true
    }),
    venue: "Planet Earth"
  },
  {
    owner_id: users[1].id,
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
    writing_code: false,
    existing: false,
    external_customers: false,
    needed_role: "Services",
    product_focus: productTypes[2],
    json_needed_expertise: JSON.stringify(["throwingstar", "mandolin"]),
    customer_type: "Developers",
    json_tags: JSON.stringify(["Bing", "News", "Bingcubator", "ASGEA"]),
    video_id: null,
    created_at: daysAgo(1),
    updated_at: faker.date.recent(),
    json_meta: JSON.stringify({}),
    venue: "CNN Headquarters"
  }
];

const tagset = ["Office", "News", "Bingcubator", "Azure", "Edge", "Windows 10"];
const expertiseSet = ["xbox", "c#", "windows phone", "ios", "android", "js", ".net"];
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
    needed_role: sample(participantTypes),
    product_focus: sample(productTypes),
    json_needed_expertise: JSON.stringify(sample(expertiseSet, 2)),
    customer_type: sample(customerTypes),
    json_tags: JSON.stringify(sample(tagset, 3)),
    video_id: sample([count, null]),
    created_at: faker.date.recent(),
    updated_at: faker.date.recent()
  }));
}

export const hackathonAdmins = [
  {
    user_id: users[0].id,
    hackathon_id: 1
  },
  {
    user_id: users[1].id,
    hackathon_id: 1
  },
  {
    user_id: users[1].id,
    hackathon_id: 2
  }
];

export const members = [
  {
    user_id: users[0].id,
    project_id: 1,
    hackathon_id: 1
  },
  {
    user_id: users[1].id,
    project_id: 1,
    hackathon_id: 1
  },
  {
    user_id: users[1].id,
    project_id: 2,
    hackathon_id: 1
  },
  // third user has project in hackathon #2
  // this is important to test `has_project`
  // filtering of user search
  {
    user_id: users[2].id,
    project_id: 3,
    hackathon_id: 2
  }
];

// add a user 4 to a bunch of projects in hackathon 2
// this supports our testing for duplicate results
count = 5;
while (count--) {
  members.push({
    user_id: users[3].id,
    project_id: count + 3,
    hackathon_id: 2
  });
}

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
    hackathon_id: 1,
    joined_at: daysAgo(4),
    json_participation_meta: JSON.stringify({icecream: true})
  },
  {
    user_id: users[1].id,
    hackathon_id: 1,
    joined_at: daysAgo(3),
    json_participation_meta: JSON.stringify({icecream: true})
  },
  {
    user_id: users[1].id,
    hackathon_id: 2,
    joined_at: daysAgo(2),
    json_participation_meta: JSON.stringify({})
  },
  {
    user_id: users[3].id,
    hackathon_id: 2,
    joined_at: daysAgo(1),
    json_participation_meta: JSON.stringify({})
  }
];

// add all dynamically generated users as participants of
// hackathon 2
dynamicallyGeneratedUsers.forEach(({id}) => participants.push({
  user_id: id,
  hackathon_id: 2,
  json_participation_meta: JSON.stringify({})
}));


export const awardCategories = [
  {
    hackathon_id: 1,
    name: "Challenge Winners"
  },
  {
    hackathon_id: 1,
    name: "Advertisers",
    parent_id: 1
  }
];
