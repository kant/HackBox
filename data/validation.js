import Joi from "joi";

export const optionalId = Joi.number().integer().positive();
export const id = optionalId.required();

export const pagination = Joi.object().keys({
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0)
});

/*
  Hackathons
*/
const hackathonBase = {
  name: Joi.string().min(3).max(30).trim(),
  slug: Joi.string().lowercase().regex(/^[a-z0-9\-]*$/).trim(),
  description: Joi.string().min(3).max(300).trim(),
  logo_url: Joi.string().uri().default("http://placehold.it/150x150"),
  start_date: Joi.date(),
  end_date: Joi.date().min(Joi.ref("start_date"))
};
export const hackathonUpdate = Joi.object(hackathonBase);
export const newHackathon = Joi.object(hackathonBase)
  .requiredKeys("name", "slug", "description", "logo_url", "start_date", "end_date");
export const hackathon = newHackathon.keys({id});

/*
  Participants
*/
const userBase = {
  name: Joi.string().min(3).max(60).trim().required(),
  phone: Joi.string().regex(/^[0-9\(\) \+]*$/).trim().required(),
  title: Joi.string().min(0).max(30).trim().required(),
  email: Joi.string().email().required(),
  username: Joi.string().min(1).max(30).trim().required()
};
export const newUser = Joi.object(userBase);
export const user = newUser.keys({id});

/*
  Project
*/
const projectBase = {
  owner_id: id,
  venue_id: id,
  video_id: optionalId,
  title: Joi.string().min(3).max(30).required(),
  tagline: Joi.string().min(3).max(60),
  status: Joi.string(),
  description: Joi.string(),
  image_url: Joi.string().uri(),
  code_repo_url: Joi.string().uri(),
  prototype_url: Joi.string().uri(),
  supporting_files_url: Joi.string().uri(),
  inspiration: Joi.string(),
  how_it_will_work: Joi.string(),
  needs_hackers: Joi.boolean(),
  tags: Joi.array().unique().items(Joi.string().min(1).max(30))
};
export const newProject = Joi.object(projectBase);
export const project = newProject.keys({id});

/*
  Project
*/
const commentBase = {
  body: Joi.string().min(3).max(2000),
  user_id: id
};
export const newComment = Joi.object().keys(commentBase);
export const comment = newComment.keys({id});
