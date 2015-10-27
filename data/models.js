/*eslint no-use-before-define: 0*/
import db from "../db-connection";
import bookshelfLib from "bookshelf";

const bookshelf = bookshelfLib(db);

export const Hackathon = bookshelf.Model.extend({
  tableName: "hackathons",
  projects() {
    return this.hasMany(Project);
  },
  participants() {
    return this.belongsToMany(User, "participants");
  }
});

export const User = bookshelf.Model.extend({
  tableName: "users",
  hackathons() {
    return this.belongsToMany(Hackathon, "participants");
  },
  projects() {
    return this.belongsToMany(Project, "members");
  }
});

export const Project = bookshelf.Model.extend({
  tableName: "projects",
  hackathon() {
    return this.belongsTo(Hackathon);
  },
  owner() {
    return this.hasOne(User);
  },
  members() {
    return this.belongsToMany(User, "members");
  }
});

export const Comment = bookshelf.Model.extend({
  tableName: "comments",
  user() {
    return this.hasOne(User);
  },
  project() {
    return this.belongsTo(Project);
  }
});
