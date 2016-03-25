import Joi from "joi";
import { countryList, colorSchemes,
  customerTypes, productTypes,
  participantTypes, executiveChallenges } from "./fixed-data";

/*
  re-usable types
*/
export const optionalId = Joi.number().integer().positive();
export const id = optionalId.required();
export const stringId = Joi.string().min(1).max(140).trim();
export const meta = Joi.object();
export const metaWithDefault = meta.default({});
export const emptyString = Joi.string().trim().empty("").max(255);
export const stringWithDefault = emptyString.default("");
export const emptyText = Joi.string().trim().empty("").max(1000);
export const emptyTextLarge = Joi.string().trim().empty("").max(65535, "utf8");
export const textWithDefault = emptyText.default("");
export const role = Joi.string().valid(participantTypes).empty("");
export const roleArray = Joi.array().items(role)
  .description("Array of one or more valid participant types");
export const customerType = Joi.string().valid(customerTypes).empty("");
export const customerTypeArray = Joi.array().items(customerType)
  .description("Array of one or more valid customer types");
export const neededExpertiseArray = Joi.array().items(Joi.string());
export const url = Joi.string().max(2000).uri().empty("");
export const urlWithDefault = url.default("");
export const country = Joi.string().valid(countryList).empty("");
export const countryArray = Joi.array().items(country)
  .description("Array of one or more valid country");
export const product = Joi.string().valid(productTypes).empty("");
export const productArray = Joi.array().items(product)
  .description("Array of one or more valid product types");
export const arrayOfStrings = Joi.array().items(Joi.string());
export const challenge = Joi.string().valid(executiveChallenges).empty("");
export const challengeArray = Joi.array().items(challenge);

/*
  Pagination
*/
export const pagination = Joi.object().keys({
  limit: Joi.number().integer().min(1).max(100).default(25),
  offset: Joi.number().integer().min(0).default(0)
});

const includeDeleted = Joi.boolean().default(false);
const includeUnpublished = Joi.boolean().default(false);

export const deleted = Joi.object().keys({
  include_deleted: includeDeleted
});

export const paginationWithDeleted = pagination.keys({
  include_deleted: includeDeleted,
  include_unpublished: includeUnpublished
});

export const paginationResults = pagination.keys({
  total_count: Joi.number().integer().min(0),
  result_count: Joi.number().integer().min(0)
}).requiredKeys("limit", "offset", "total_count", "result_count");

/*
  Users
*/
const userBase = {
  id: stringId,
  expertise: arrayOfStrings,
  working_on: arrayOfStrings,
  interests: arrayOfStrings,
  primary_role: role,
  product_focus: product,
  country,
  meta,
  deleted: Joi.boolean(),
  shares: Joi.number().integer().min(0),
  likes: Joi.number().integer().min(0),
  views: Joi.number().integer().min(0),
  name: Joi.string().min(1).max(140).trim(),
  family_name: Joi.string().min(1).max(140).trim(),
  given_name: Joi.string().min(1).max(140).trim(),
  email: Joi.string().email().trim(),
  profession: Joi.string().max(255).trim(),
  discipline: Joi.string().max(255).trim(),
  city: Joi.string().max(255).trim(),
  alias: Joi.string().max(255).trim(),
  job_title: Joi.string().max(255).trim(),
  department: Joi.string().max(255).trim()
};
export const newUser = Joi.object(userBase);
export const updateUser = Joi.object(userBase);
export const user = newUser.keys({
  id: stringId.required(),
  expertise: arrayOfStrings.default([]),
  working_on: arrayOfStrings.default([]),
  interests: arrayOfStrings.default([]),
  deleted: Joi.boolean().required(),
  name: userBase.name.required(),
  family_name: userBase.family_name.required(),
  given_name: userBase.given_name.required(),
  email: userBase.email.required(),
  profile: meta.required()
});

/*
  Participants
*/
export const newParticipant = Joi.object({
  participation_meta: metaWithDefault
});
export const participant = user.keys({
  participation_meta: metaWithDefault
}).requiredKeys("participation_meta");

/*
  Hackathons
*/
const hackathonBase = {
  name: Joi.string().min(1).max(140).trim(),
  slug: Joi.string().lowercase().max(255).regex(/^[a-z0-9\-]*$/).trim(),
  tagline: emptyString,
  description: emptyTextLarge,
  judges: emptyTextLarge,
  rules: emptyTextLarge,
  schedule: emptyTextLarge,
  quick_links: emptyText,
  resources: emptyText,
  logo_url: url,
  header_image_url: url,
  start_at: Joi.date(),
  end_at: Joi.date(),
  org: emptyString,
  city: emptyString,
  country,
  color_scheme: Joi.any().valid(colorSchemes),
  is_public: Joi.boolean(),
  is_published: Joi.boolean(),
  deleted: Joi.boolean(),
  show_name: Joi.boolean(),
  show_judges: Joi.boolean(),
  show_rules: Joi.boolean(),
  show_schedule: Joi.boolean(),
  meta
};
export const hackathonUpdate = Joi.object(hackathonBase);
export const newHackathon = Joi.object(hackathonBase)
  .requiredKeys("name", "slug", "logo_url", "start_at", "end_at", "city", "country")
  .keys({
    color_scheme: Joi.any().valid(colorSchemes).default(colorSchemes[3]),
    tagline: hackathonBase.tagline.default(""),
    description: hackathonBase.description.default(""),
    judges: hackathonBase.judges.default(""),
    rules: hackathonBase.rules.default(""),
    schedule: hackathonBase.schedule.default(""),
    quick_links: hackathonBase.quick_links.default(""),
    resources: hackathonBase.resources.default(""),
    org: hackathonBase.org.default(""),
    city: hackathonBase.org.default(""),
    meta: metaWithDefault,
    logo_url: urlWithDefault,
    header_image_url: urlWithDefault
  });
export const hackathon = newHackathon
  .keys({
    id,
    deleted: Joi.boolean(),
    projects: Joi.number().integer().min(0),
    participants: Joi.number().integer().min(0),
    status: Joi.string(),
    end_at: Joi.date().allow(null)
  });


/*
  Project
*/
const projectBase = {
  owner_id: stringId,
  video_id: optionalId,
  title: Joi.string().min(1).max(120),
  tagline: emptyString,
  status: emptyString,
  description: emptyTextLarge,
  image_url: url,
  code_repo_url: url,
  prototype_url: url,
  supporting_files_url: url,
  inspiration: emptyTextLarge,
  how_it_will_work: emptyTextLarge,
  needs_hackers: Joi.boolean(),
  writing_code: Joi.boolean(),
  existing: Joi.boolean(),
  external_customers: Joi.boolean(),
  needed_role: role,
  product_focus: product,
  windows_focus: arrayOfStrings,
  devices_focus: arrayOfStrings,
  dynamics_focus: arrayOfStrings,
  third_party_platforms_focus: arrayOfStrings,
  cloud_enterprise_focus: arrayOfStrings,
  consumer_services_focus: arrayOfStrings,
  office_focus: arrayOfStrings,
  misc_focus: arrayOfStrings,
  other_focus: arrayOfStrings,
  needed_expertise: arrayOfStrings,
  customer_type: customerType,
  tags: arrayOfStrings,
  deleted: Joi.boolean(),
  venue: Joi.string().max(255).trim().default(""),
  executive_challenges: challengeArray,
  meta
};
export const projectUpdate = Joi.object(projectBase);
export const newProject = Joi.object(projectBase)
  .requiredKeys("title", "tagline", "description", "needs_hackers")
  .keys({
    status: projectBase.status.default(""),
    description: projectBase.description.default(""),
    inspiration: projectBase.inspiration.default(""),
    how_it_will_work: projectBase.how_it_will_work.default(""),
    needs_hackers: Joi.boolean().default(false),
    writing_code: Joi.boolean().default(false),
    existing: Joi.boolean().default(false),
    external_customers: Joi.boolean().default(false),
    needed_role: role.default(""),
    product_focus: product.default(""),
    windows_focus: arrayOfStrings.default([]),
    devices_focus: arrayOfStrings.default([]),
    dynamics_focus: arrayOfStrings.default([]),
    third_party_platforms_focus: arrayOfStrings.default([]),
    cloud_enterprise_focus: arrayOfStrings.default([]),
    consumer_services_focus: arrayOfStrings.default([]),
    office_focus: arrayOfStrings.default([]),
    misc_focus: arrayOfStrings.default([]),
    other_focus: arrayOfStrings.default([]),
    needed_expertise: arrayOfStrings.default([]),
    customer_type: customerType.default(""),
    tags: arrayOfStrings.default([]),
    meta: metaWithDefault,
    image_url: urlWithDefault,
    code_repo_url: urlWithDefault,
    prototype_url: urlWithDefault,
    supporting_files_url: urlWithDefault,
    venue: projectBase.venue.default(""),
    executive_challenges: challengeArray.default([])
  });
export const project = newProject.keys({id});

/*
  Comment
*/
const commentBase = {
  body: Joi.string().min(1).max(2000)
};
export const newComment = Joi.object().keys(commentBase);
export const comment = newComment.keys({
  id,
  user_id: stringId,
  project_id: id,
  created_at: Joi.date()
}).requiredKeys("id", "user_id", "project_id", "body", "created_at");

/*
  Award
*/
const awardBase = {
  name: Joi.string().min(1).max(140).trim(),
  meta: metaWithDefault
};
export const awardUpdate = Joi.object(awardBase).keys({
  project_id: optionalId
});
export const newAward = Joi.object(awardBase).keys({
  project_id: id,
  award_category_ids: Joi.array().items(id)
}).requiredKeys("name", "project_id");
export const award = Joi.object(awardBase).keys({
  id,
  hackathon_id: id,
  project_id: id,
  award_categories: Joi.array()
}).requiredKeys("id", "hackathon_id", "project_id", "name");

/*
  Award Category
*/
const awardCategoryBase = {
  name: Joi.string().min(1).max(140).trim()
};
export const awardCategoryUpdate = Joi.object(awardCategoryBase);
export const newAwardCategory = Joi.object(awardCategoryBase).keys({
  parent_id: optionalId.allow(null)
}).requiredKeys("name");
export const awardCategory = newAwardCategory.keys({
  id,
  hackathon_id: id
}).requiredKeys("id", "hackathon_id", "name");

/*
  Sorting
*/
export const sortDirection = Joi.any().valid("asc", "desc");
