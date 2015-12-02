import sample from "lodash.sample";
import faker from "faker";
import { participantTypes, customerTypes, productTypes } from "./fixed-data";

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
    expertise: "JS",
    working_on: "progressive web apps",
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
    expertise: "KidsBooks",
    working_on: "writing",
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
    expertise: "persistance",
    working_on: "convincing cat to try green eggs and ham",
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
    expertise: "",
    working_on: "",
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
    name: "Hack the planet",
    slug: "hack-the-planet",
    description: "Yep, hack the planet!",
    logo_url: "http://example.com/hack.gif",
    start_at: new Date(yesterday),
    end_at: new Date(fiveDaysFromNow),
    org: "Hackers Inc.",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    city: "Redmond",
    country: "USA",
    color_scheme: "Azure blue",
    json_meta: JSON.stringify({}),
    is_public: true
  },
  {
    name: "Hack the planet, again!",
    slug: "hack-the-planet-again",
    description: "No really, I'm serious... hack the planet!",
    logo_url: "http://example.com/uberhack.gif",
    start_at: new Date(yesterday),
    end_at: new Date(fiveDaysFromNow),
    org: "Hackers LLC",
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    city: "Mumbai",
    country: "India",
    color_scheme: "Xbox green",
    json_meta: JSON.stringify({}),
    is_public: false
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
    needed_role: participantTypes[0],
    product_focus: productTypes[0],
    needed_expertise: ["bostaff", "nunchuck"].join(),
    customer_type: customerTypes[0],
    tags: ["Yo", "Social"].join(),
    video_id: 47,
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    json_meta: JSON.stringify({
      is_awesome: true
    })
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
    needed_role: participantTypes[1],
    product_focus: productTypes[2],
    needed_expertise: ["throwingstar", "mandolin"].join(),
    customer_type: customerTypes[2],
    tags: ["Bing", "News", "Bingcubator", "ASGEA"].join(","),
    video_id: null,
    created_at: faker.date.recent(),
    updated_at: faker.date.recent(),
    json_meta: JSON.stringify({})
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
    needed_expertise: sample(expertiseSet, 2).join(),
    customer_type: sample(customerTypes),
    tags: sample(tagset, 3).join(),
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
    hackathon_id: 1,
    json_participation_meta: JSON.stringify({icecream: true})
  },
  {
    user_id: users[1].id,
    hackathon_id: 1,
    json_participation_meta: JSON.stringify({icecream: true})
  },
  {
    user_id: users[1].id,
    hackathon_id: 2,
    json_participation_meta: JSON.stringify({})
  }
];
