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
  name: Joi.string().min(3).max(30).trim().required(),
  slug: Joi.string().lowercase().regex(/^[a-z0-9\-]*$/).trim().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().min(Joi.ref("start_date")).required()
};
export const newHackathon = Joi.object().keys(hackathonBase);
export const hackathon = Joi.object().keys(Object.assign({id}, hackathonBase));

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
export const newUser = Joi.object().keys(userBase);
export const user = Joi.object().keys(Object.assign({id}, userBase));

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
export const newProject = Joi.object().keys(projectBase);
export const project = Joi.object().keys(Object.assign({id}, projectBase));

/*
  Project
*/
const commentBase = {
  body: Joi.string().min(3).max(2000),
  user_id: id
};
export const newComment = Joi.object().keys(commentBase);
export const comment = Joi.object().keys(Object.assign({id}, commentBase));
