# Database

This page contains some brief documentation about the database hackbox uses.

## Type

MySQL

## Diagram

Created with [Mondraw](http://monodraw.helftone.com/) original file in `/graphics`

```
┌─────────────────────────────────┐   ┌───────────────────┐     ┌───────────────────┐
│ projects                        │   │ hackathons        │     │ hackathon_admins  │
├─────────────────────────────────┤   ├───────────────────┤    ╱├───────────────────┤╲
│ id                              │   │ id                │  ┌──│ user_id           │──┐
│ owner_id                        │   │ name              │  │ ╲│ hackathon_id      │╱ │
│ hackathon_id                    │   │ slug              │  │  └───────────────────┘  │
│ title                           │   │ tagline           │  │                         │
│ tagline                         │   │ description       │  │  ┌───────────────────┐  │
│ status                          │   │ judges            │  │  │ participants      │  │
│ description                     │   │ rules             │  │ ╱├───────────────────┤╲ │
│ image_url                       │   │ schedule          │  ├──│ user_id           │──┤
│ code_repo_url                   │   │ quick_links       │  │ ╲│ hackathon_id      │╱ │
│ prototype_url                   │   │ resources         │  │  └───────────────────┘  │
│ supporting_files_url            │   │ logo_url          │  │                         │
│ inspiration                     │   │ header_image_url  │  │  ┌───────────────────┐  │
│ how_it_will_work                │   │ start_at          │  │  │ users             │  │
│ needs_hackers                   │ ┌┼│ end_at            │┼─┘  ├───────────────────┤  │
│ writing_code                    │ │ │ org               │     │ id                │  │
│ existing                        │╲│ │ city              │     │ name              │  │
│ external_customers              │─┘ │ country           │     │ family_name       │  │
│ needed_role                     │╱  │ color_scheme      │     │ given_name        │  │
│ json_needed_expertise           │   │ created_at        │     │ email             │  │
│ product_focus                   │   │ updated_at        │     │ bio               │  │
│ json_windows_focus              │   │ show_name         │     │ country           │  │
│ json_devices_focus              │   │ show_judges       │     │ city              │  │
│ json_dynamics_focus             │   │ show_rules        │     │ created_at        │  │
│ json_third_party_platforms_focus│   │ show_schedule     │     │ updated_at        │┼─┘
│ json_cloud_enterprise_focus     │   │ deleted           │     │ deleted           │
│ json_consumer_services_focus    │   │ is_public         │     │ json_working_on   │
│ json_office_focus               │   │ is_published      │     │ json_expertise    │
│ json_misc_focus                 │   │ json_meta         │     │ primary_role      │
│ json_other_focus                │   └───────────────────┘     │ product_focus     │
│ customer_type                   │             ┼               │ profession        │
│ json_tags                       │    ┌────────┤               │ discipline        │
│ video_id                        │    │        │               │ alias             │
│ created_at                      │    │        └────────┐      │ json_profile      │
│ updated_at                      │    │                 │      │ json_meta         │
│ deleted                         │    │                 │      │ json_interests    │
└─────────────────────────────────┘    │                ╱│╲     └───────────────────┘
                 ┼                     │       ┌───────────────────┐      ┼
             ┌───┴────────────┐        │       │ members           │      │
            ╱│╲               │        │       ├───────────────────┤      │
┌─────────────────────────┐   │        │      ╱│ user_id           │╲     │
│ awards                  │   └────────┼──┬────│ project_id        │──────┤
├─────────────────────────┤            │  │   ╲│ hackathon_id      │╱     │
│ id                      │            │  │    │ joined_at         │      │
│ hackathon_id            │            │  │    └───────────────────┘      │
│ project_id              │            │  │    ┌───────────────────┐      │
│ name                    │            │  │    │ comments          │      │
│ json_meta               │            │  │    ├───────────────────┤      │
└─────────────────────────┘            │  │   ╱│ id                │╲     │
             ┼                         │  ├────│ user_id           │──────┤
             │                         │  │   ╲│ project_id        │╱     │
            ╱│╲                        │  │    │ body              │      │
┌─────────────────────────┐            │  │    │ created_at        │      │
│ awards_award_categories │            │  │    └───────────────────┘      │
├─────────────────────────┤            │  │    ┌───────────────────┐      │
│ award_id                │            │  │    │ likes             │      │
│ award_category_id       │            │  │   ╱├───────────────────┤╲     │
└─────────────────────────┘            │  ├────│ user_id           │──────┤
            ╲│╱                        │  │   ╲│ project_id        │╱     │
             │                         │  │    │ created_at        │      │
             ┼                         │  │    └───────────────────┘      │
┌─────────────────────────┐            │  │    ┌───────────────────┐      │
│ award_categories        │            │  │    │ shares            │      │
├─────────────────────────┤            │  │   ╱├───────────────────┤╲     │
│ id                      │╲           │  ├────│ user_id           │──────┤
│ hackathon_id            │────────────┘  │   ╲│ project_id        │╱     │
│ parent_id               │╱              │    │ created_at        │      │
│ name                    │               │    └───────────────────┘      │
│                         │               │    ┌───────────────────┐      │
└─────────────────────────┘               │    │ views             │      │
                                          │   ╱├───────────────────┤╲     │
                                          └────│ user_id           │──────┘
                                              ╲│ project_id        │╱
                                               │ created_at        │
                                               └───────────────────┘
```