import Joi from "joi";

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

export const paginationResults = pagination.keys({
  total_count: Joi.number().integer().min(0),
  result_count: Joi.number().integer().min(0)
}).requiredKeys("limit", "offset", "total_count", "result_count");

/*
  Users
*/
export const newUser = Joi.object({
  id: stringId,
  name: Joi.string().min(1).max(140).trim(),
  family_name: Joi.string().min(1).max(140).trim(),
  given_name: Joi.string().min(1).max(140).trim(),
  email: Joi.string().email().trim(),
  profile: Joi.object().default({})
});
export const user = newUser.keys({id});

/*
  Hackathons
*/
const hackathonBase = {
  name: Joi.string().min(1).max(140).trim(),
  slug: Joi.string().lowercase().max(255).regex(/^[a-z0-9\-]*$/).trim(),
  description: Joi.string().min(3).max(1000).trim(),
  logo_url: Joi.string().max(255).uri().default("http://placehold.it/150x150"),
  start_at: Joi.date(),
  end_at: Joi.date().min(Joi.ref("start_at")),
  meta: Joi.object().default({})
};
export const hackathonUpdate = Joi.object(hackathonBase);
export const newHackathon = Joi.object(hackathonBase)
  .requiredKeys("name", "slug", "description", "logo_url", "start_at", "end_at");
export const hackathon = newHackathon.keys({id});


/*
  Project
*/
const projectBase = {
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
  body: Joi.string().min(1).max(2000),
  user_id: id
};
export const newComment = Joi.object().keys(commentBase);
export const comment = newComment.keys({id});
