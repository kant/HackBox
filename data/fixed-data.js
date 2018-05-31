const customerTypes = [

  "Advertisers",
  "Businesses",
  "Consumers",
  "Developers",
  "Industries",
  "IT Pros",
  "Millennials",
  "Microsoft Employees",
  "Nonprofits",
  "People with Disability",
  "Public Sector",
  "Students and Educators",
  "Women and Girls",
  "Other",
  "None"

];

const productTypes = [

  "3rd Party Platforms",
  "Cloud & Enterprise",
  "AI & Research",
  "Consumer Services",
  "Devices",
  "Dynamics",
  "Misc",
  "Office 365",
  "Dynamics 365",
  "Other",
  "Windows",
  "Linkedin"

];

const expertiseTypes = [

  "JavaScript",
  "Azure",
  "Android",
  "C#",
  "IoT",
  "Python",
  "Cortana",
  "iOS",
  "Skype"

];

const projectTypes = [

  "Azure",
  "Office",
  "Bing",
  "Windows 10",
  "Skype",
  "Dynamics",
  "Xbox",
  "Sql",
  "Visual Studio",
  "HoloLens",
  "Sharepoint",
  "Windows Phone",
  "Cortana",
  "IoT",
  "SQL",
  "MSIT",
  "Exchange",
  "Power BI",
  "Machine Learning",
  "Mobile",
  "InTune",
  "Yammer",
  "LinkedIn"

];

const participantTypes = [

  "Business Programs & Ops",
  "Content Publishing",
  "Data Science",
  "Design",
  "Design Research",
  "Developer",
  "Evangelism",
  "Finance",
  "HR",
  "HW Engineering",
  "IT Operations",
  "Corporate, External and Legal Affairs (CELA)",
  "Marketing",
  "PM",
  "Sales",
  "Service Eng",
  "Services",
  "Supply Chain & Ops"

];

const countryList = [

  "United States",
  "Worldwide",
  "No country",
  "Europe",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Belarus",
  "Belgium",
  "Bosnia and Herzegovina",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Côte d'Ivoire",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Guatemala",
  "Hong Kong SAR",
  "Hungary",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Korea",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Serbia",
  "Serbia and Montenegro",
  "Singapore",
  "Slovakia",
  "South Africa",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "Uruguay",
  "Vietnam",
  "Zimbabwe"

];

const europeList = [
  "Albania",
  "Austria",
  "Belarus",
  "Belgium",
  "Bosnia and Herzegovina",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Montenegro",
  "Netherlands",
  "Norway",
  "Poland",
  "Romania",
  "Russia",
  "Serbia",
  "Serbia and Montenegro",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "Switzerland",
  "Turkey",
  "Ukraine",
  "United Kingdom"

]

const colorSchemes = [

  "Azure blue",
  "Bing gold",
  "Office red",
  "Visual Studio purple",
  "Windows blue",
  "Xbox green",
  "Skype blue"

];

// const executiveChallenges = [

//   "Judson Althoff--Empower customers to harness the power of the cloud to drive digital transformation.--Judson.Althoff@microsoft.com",
//   "Chris Capossela--How do we grow millennial fans in both enterprise and consumer for Office?--Chris.Capossela@microsoft.com",
//   "Jean-Philippe Courtois--Empower our field organization to identify the highest propensity Cloud customers and partners.--jeanc@microsoft.com",
//   "Kurt DelBene--How can Microsoft empower employees and accelerate customer engagement with digital transformation?--Kurt.DelBene@microsoft.com",
//   "Scott Guthrie--Show ways to make Azure the #1 cloud in commercial segments.--scottgu@microsoft.com",
//   "Kathleen Hogan--How can we establish a culture of learning that is as strong as our culture of giving?--khogan@microsoft.com",
//   "Amy Hood--Create examples of our internal first party systems being applicable, sellable showcases for our customers.--amyhood@microsoft.com",
//   "Rajesh Jha--Show us how our products and services can work together seamlessly in service of end to end customer scenarios.--rajeshj@microsoft.com",
//   "Terry Myerson--Use Windows 10 Creators Update to make something that inspires the creator in all of us.--Terry.Myerson@microsoft.com",
//   "Kevin Scott--How can we help more developers innovate and achieve success with Microsoft technology and platforms?--kvnscott@microsoft.com",
//   "Harry Shum--Build solutions that infuse AI into Microsoft products and services.--hshum@microsoft.com",
//   "Brad Smith--Demonstrate new ways for Microsoft talent and technology to help solve the world’s greatest societal problems. (Hack for Good)--Brad.Smith@microsoft.com",
//   "Jeff Weiner--How can Microsoft help grow LinkedIn faster while at the same time, differentiating Microsoft products to create more value for customers?--jweiner@linkedin.com"

// ];
const executiveChallenges = [

  "Modern Workplace--Create something to help businesses empower employees and foster a new culture of work by unlocking creativity and enabling teamwork in a secure and simple way.",
  "Applications and Infrastructure--Create something that enables customers to have consistent identity, developer extensibility, and security across their application portfolio.",    
  "Data and AI--Create something that uses Data and AI to amplify human ingenuity and drives competitive advantage for businesses.",
  "Gaming--Create something that enables gamers to play the games they want, with the people they want, on the devices they want.",
  "Business Apps--Create something that accelerates the digitization of every business process.",
  "Modern Life--Create something that could help people make the most of their time to achieve more.",
  "AI and Ethics--Build AI Solutions that advance our AI principles and the pursuit of ethical AI for our customers and the world.",
  "Inclusive Microsoft--Create something that continues to build an inclusive culture and productive work environment for all.",
  "Internal Digital Transformation--Re-invent how we operate and radically improve the experience of our customers, partners, and employees to accelerate growth for Microsoft.",
  "Sales--Demonstrate your customer obsession by creating an innovative solution that accelerates our ability to sell, deliver world class service, and enable our customers' digital success.",
  "Hack for Good--Create something with Microsoft technology and your unique skills to help nonprofits drive social impact and achieve their missions more effectively.",  
  "Marketing--Create a marketing or business plan that helps us reach and engage Millennials with the goal of earning them as fans across our products and services.",
  "New Growth Ideas--Using Microsoft assets, create a new area of growth for the company that will attract new customers and/or new business.",
  "LinkedIn--How does LinkedIn feature in an ambient computing world?",  
  "Finance--Create something that provides a CFO with daily business insight that assists her/him in making astute company decisions.",  
  "Other--Does not align to any other Challenge."
];

const projectMotivations = [

  "Have fun",
  "Learn a new technology or skill",
  "Work on something that is not part of my day job",
  "Collaborate with people outside my usual workgroup",
  "Create a new product, service, program, or process",
  "Improve or update an existing product, service, program, or process",
  "I am passionate about a cause",
  "Finally work on the idea that we haven’t had time for",
  "Work on a project I hope to eventually launch to external customers",
  "Work on a project I think has commercial or strategic value for Microsoft",
  "Other"

];

export default {
  customerTypes,
  productTypes,
  expertiseTypes,
  projectTypes,
  participantTypes,
  projectMotivations,
  countryList,
  europeList,
  colorSchemes,
  executiveChallenges
};

