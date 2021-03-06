import Joi from "joi";
import {

  countryList,
  colorSchemes,
  customerTypes,
  productTypes,
  projectTypes,
  participantTypes,
  executiveChallenges

} from "./fixed-data";

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
export const name = Joi.string().min(1).max(140).trim();
export const role = Joi.string().valid(participantTypes).empty("");
export const roleArray = Joi.array().items(role)
  .description("Array of one or more valid participant types");
export const customerType = Joi.string().valid(customerTypes);
export const customerTypeArray = Joi.array().items(customerType)
  .description("Array of one or more valid customer types");
export const neededExpertiseArray = Joi.array().items(Joi.string());
export const url = Joi.string().max(2000).uri().allow("");
export const urlWithDefault = url.default("");
export const country = Joi.string().valid(countryList).empty("");
export const countryArray = Joi.array().items(country)
  .description("Array of one or more valid country");
export const product = Joi.string().valid(productTypes).empty("");
export const productArray = Joi.array().items(product)
  .description("Array of one or more valid product types");
export const projectType = Joi.string().valid(projectTypes).empty("");
export const projectArray = Joi.array().items(projectType)
  .description("Array of one or more valid project types");
export const arrayOfStrings = Joi.array().items(Joi.string());
export const focusArray = Joi.array().items(Joi.string())
  .description("Array of one or more focus types");
export const challenge = Joi.string().valid(executiveChallenges).empty("");
export const challengeArray = Joi.array().items(challenge)
  .description("Array of one or more Executive Challenges");
export const idArray = Joi.array().items(optionalId).required();
export const stringIdArray = Joi.array().items(stringId).required();

/*
  Pagination
*/
export const pagination = Joi.object().keys({
  limit: Joi.number().integer().min(1).max(1000000).default(25),
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
  country: Joi.string().max(255).empty(""),
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
  city: Joi.string().max(255).trim().allow(""),
  alias: Joi.string().max(255).trim(),
  job_title: Joi.string().max(255).trim(),
  department: Joi.string().max(255).trim(),
  organization_id: Joi.number().integer().min(0),
  major: Joi.string().max(255).trim().allow(""),
  school: Joi.string().max(255).trim().allow(""),
  state: Joi.string().max(255).trim().allow("").allow(null),
  phone: Joi.string().max(16).trim().allow("").allow(null),
  organization: Joi.string().max(255).trim(),
  external: Joi.string().max(255).trim(),
  graph_data_updated: Joi.date(),
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
  end_at: Joi.date().allow(null, ''),
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
  show_challenges: Joi.boolean(),
  meta,
  custom_categories: arrayOfStrings
};
export const hackathonUpdate = Joi.object(hackathonBase);
export const newHackathon = Joi.object(hackathonBase)
  .requiredKeys("name", "slug", "logo_url", "start_at", "city", "country")
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
    end_at: Joi.date().allow(null),
    meta: metaWithDefault,
    logo_url: urlWithDefault,
    header_image_url: urlWithDefault,
    show_challenges: Joi.boolean(),
    custom_categories: arrayOfStrings.default([])
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
  title: Joi.string().min(1).max(120),
  tagline: emptyString,
  owner_id: stringId,
  video_id: [Joi.number().integer().positive(), Joi.empty("").default(0)],
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
  garage_ship_channel: Joi.boolean(),
  existing: Joi.boolean(),
  external_customers: Joi.boolean(),
  needed_roles: roleArray,
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
  project_motivations: arrayOfStrings,
  focus: arrayOfStrings,
  deleted: Joi.boolean(),
  venue: [Joi.string().allow(null), emptyString],
  executive_challenges: challengeArray,
  video_type: emptyString,
  meta,
  custom_categories: arrayOfStrings,
  video_data: Joi.string().allow(null),
  video_views: Joi.number().integer().min(0),
  tent_name: Joi.string().max(255).allow(null),
  tent_color: Joi.string().max(255).allow(null),
  vstsProjectId: Joi.string().max(100).allow(null),
  vstsProjectName: Joi.string().max(100).allow(null),
  vstsGroupId: Joi.string().max(50).allow(null),
  vstsGroupName: Joi.string().max(100).allow(null),
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
    garage_ship_channel: Joi.boolean().default(false),
    existing: Joi.boolean().default(false),
    external_customers: Joi.boolean().default(false),
    needed_roles: roleArray.default([]),
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
    customer_type: customerType,
    tags: arrayOfStrings.default([]),
    project_motivations: arrayOfStrings.default([]),
    focus: arrayOfStrings.default([]),
    meta: metaWithDefault,
    image_url: urlWithDefault,
    code_repo_url: urlWithDefault,
    prototype_url: urlWithDefault,
    supporting_files_url: urlWithDefault,
    venue: projectBase.venue,
    executive_challenges: projectBase.executive_challenges,
    video_type: projectBase.video_type,
    custom_categories: arrayOfStrings.default([]),
    video_views: projectBase.video_views,
    tent_name: projectBase.tent_name,
    tent_color: projectBase.tent_color,
    vstsProjectId: projectBase.vstsProjectId,
    vstsProjectName: projectBase.vstsProjectName,
    vstsGroupId: projectBase.vstsGroupId,
    vstsGroupName: projectBase.vstsGroupName,
  });
export const project = newProject.keys({ id });

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

/*
  Voting
*/
export const voteCategoryId = Joi.any().only(0, 1, 2, 3, 4)
  .description("Valid vote categories are 0-4");
