import Joi from "joi";
import moment from "moment";
import { countryList } from "./fixed-data";

/*
  date formatters
*/
export const formatDate = (date) => moment(date).format("YYYY-MM-DD");
export const formatTime = (date) => moment(date).startOf("minute").format("HH:MM");

/*
  Id types
*/
export const optionalId = Joi.number().integer().positive();
export const id = optionalId.required();
export const stringId = Joi.string().min(1).max(140).trim();

/*
  Pagination
*/
export const pagination = Joi.object().keys({
  limit: Joi.number().integer().min(1).max(100).default(25),
  offset: Joi.number().integer().min(0).default(0)
});

const includeDeleted = Joi.boolean().default(false);

export const deleted = Joi.object().keys({
  include_deleted: includeDeleted
});

export const paginationWithDeleted = pagination.keys({
  include_deleted: includeDeleted
});

export const paginationResults = pagination.keys({
  total_count: Joi.number().integer().min(0),
  result_count: Joi.number().integer().min(0)
}).requiredKeys("limit", "offset", "total_count", "result_count");

/*
  Users
*/
const userBase = {
  expertise: Joi.string(),
  working_on: Joi.string(),
  meta: Joi.object().default({}),
  deleted: Joi.boolean()
};
export const newUser = Joi.object(userBase)
  .requiredKeys("expertise", "working_on");
export const updateUser = Joi.object(userBase);
export const user = newUser.keys({
  id: stringId.required(),
  deleted: Joi.boolean().required(),
  name: Joi.string().min(1).max(140).trim().required(),
  family_name: Joi.string().min(1).max(140).trim().required(),
  given_name: Joi.string().min(1).max(140).trim().required(),
  email: Joi.string().email().trim().required(),
  profile: Joi.object().default({}).required()
});

/*
  Hackathons
*/
const hackathonBase = {
  name: Joi.string().min(1).max(140).trim(),
  slug: Joi.string().lowercase().max(255).regex(/^[a-z0-9\-]*$/).trim(),
  description: Joi.string().min(3).max(1000).trim(),
  logo_url: Joi.string().max(255).uri().default("http://placehold.it/150x150"),
  start_date: Joi.date().format("YYYY-MM-DD").raw(),
  start_time: Joi.string().regex(/^\d\d\:\d\d$/),
  end_date: Joi.date().format("YYYY-MM-DD").raw(),
  end_time: Joi.string().regex(/^\d\d\:\d\d$/),
  city: Joi.string(),
  country: Joi.any().allow(countryList),
  meta: Joi.object().default({}),
  deleted: Joi.boolean()
};
export const hackathonUpdate = Joi.object(hackathonBase);
export const newHackathon = Joi.object(hackathonBase)
  .requiredKeys("name", "slug", "description", "logo_url", "start_date", "start_time", "end_date", "end_time", "city", "country");
export const hackathon = newHackathon.keys({
  id,
  deleted: Joi.boolean()
});


/*
  Project
*/
const projectBase = {
  owner_id: stringId,
  video_id: optionalId,
  title: Joi.string().min(1).max(120),
  tagline: Joi.string().min(1).max(140),
  status: Joi.string(),
  description: Joi.string().max(1000),
  image_url: Joi.string().uri().max(255),
  code_repo_url: Joi.string().uri().max(255),
  prototype_url: Joi.string().uri().max(255),
  supporting_files_url: Joi.string().uri().max(255),
  inspiration: Joi.string().max(1000),
  how_it_will_work: Joi.string().max(1000),
  needs_hackers: Joi.boolean(),
  tags: Joi.string().regex(/^[0-9a-zA-Z]+(,[0-9a-zA-Z]+)*$/, "Tags must be a comma delimited string").max(255),
  meta: Joi.object().default({})
};
export const projectUpdate = Joi.object(projectBase);
export const newProject = Joi.object(projectBase)
  .requiredKeys("title", "tagline", "description", "needs_hackers");
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
  user_id: id,
  project_id: id,
  created_at: Joi.date()
}).requiredKeys("id", "user_id", "project_id", "body", "created_at");
