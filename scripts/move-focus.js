/*eslint no-process-exit: 0, no-console: 0, camelcase:0, strict:0*/
"use strict";

/* Migrate data from projects.needed_role to projects.json_needed_roles */
require("babel-register");
const client = require("../db-connection").default;
const Promise = require("bluebird");

const inserts = [];

const updateProject = (project, focus) => {
  const foc = focus.length > 0 ? focus : [];
  return client.update({json_focus: JSON.stringify(foc)})
    .into("projects")
    .where("id", project.id);
};

client("projects")
    .where({hackathon_id: 761})
    .then((projects) => {
        let gabas = {};

    projects.forEach((proj) => {

    let focus = [];
    let focus_misc = {miscellaneous: []};
    let focus_other = {other: []};
    let focus_windows = {windows: []};
    let focus_devices = {devices: []};
    let focus_dynamics_365 = {dynamics_365: []};
    let focus_linkedin = {linkedin: []};
    let focus_third_party_platforms = {third_party_platforms: []};
    let focus_cloud_and_enterprise = {cloud_and_enterprise: []};
    let focus_consumer_services = {consumer_services: []};
    let focus_office_365 = {office_365: []};
    let focus_ai_and_research = {ai_and_research: []};


      //MISC====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
      let misc = JSON.parse(proj.json_misc_focus);
      
      misc.forEach((m) => {
        let parsed = JSON.parse(m);
        if (parsed.value) {
          if (parsed.name === "Cognitive Services" || parsed.name === "Bot Framework" || parsed.name === "Hackbox") focus_ai_and_research.ai_and_research.push(parsed.name);
          focus_misc.miscellaneous.push(parsed.name);
        }
      });

      //WINDOWS====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
       
        let windows = JSON.parse(proj.json_windows_focus);
        windows.forEach((m) => {
            let parsed = JSON.parse(m);
                if (parsed.value) {
                if (parsed.name === "HoloLens") {
                    focus_devices.devices.push(parsed.name);
                } else if (parsed.name === "OneDrive for Consumer") {
                    focus_consumer_services.consumer_services.push('OneDrive');
                } else if (parsed.name !== "Internet Explorer") {
                    focus_windows.windows.push(parsed.name);
                }
            }
        });
    


    //Devices====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    let devices = JSON.parse(proj.json_devices_focus);
        devices.forEach((m) => {
            let parsed = JSON.parse(m);
            if (parsed.value) {
                gabas[parsed.name] = 2;
                if (parsed.name !== "Lumia" && parsed.name !== "Band") {
                    focus_devices.devices.push(parsed.name);
                }
            }   
        });
        
    


    //Dynamics====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    let dynamics = JSON.parse(proj.json_dynamics_focus);
        dynamics.forEach((m) => {
            let parsed = JSON.parse(m);
            if (parsed.value) {
                focus_dynamics_365.dynamics_365.push(parsed.name);
            }   
        });
    
    

     //Third party Platforms====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    let platforms = JSON.parse(proj.json_third_party_platforms_focus);
        platforms.forEach((m) => {
            let parsed = JSON.parse(m);
            if (parsed.value) {
                gabas[parsed.name] = 2;
                focus_third_party_platforms.third_party_platforms.push(parsed.name);
            }   
        });
        
    
    

    //Cloud and Enterprise====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    let cloud = JSON.parse(proj.json_cloud_enterprise_focus);
        cloud.forEach((m) => {
            let parsed = JSON.parse(m);
            if (parsed.value) {
                gabas[parsed.name] = 2;
                if (parsed.name === "Machine Learning") {
                    focus_ai_and_research.ai_and_research.push(parsed.name);
                } else {
                    focus_cloud_and_enterprise.cloud_and_enterprise.push(parsed.name);
                }
            }   
        });
        
    
    

    //Consumer services====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    let consumer = JSON.parse(proj.json_consumer_services_focus);
        consumer.forEach((m) => {
            let parsed = JSON.parse(m);
            if (parsed.value) {
                gabas[parsed.name] = 2;
                if (parsed.name === "Xbox Live") {
                    focus_consumer_services.consumer_services.push('Gaming (Console, PC, Xbox Live)');
                } else if (parsed.name === "Cortana" || parsed.name === "Bing") {
                    focus_ai_and_research.ai_and_research.push(parsed.name);
                } else {
                    focus_consumer_services.consumer_services.push(parsed.name);
                }
            }   
        });
        
    
    

    //Office====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    let office = JSON.parse(proj.json_office_focus);
        office.forEach((m) => {
            let parsed = JSON.parse(m);
            if (parsed.value) {
                gabas[parsed.name] = 2;
                if (parsed.name === "Lync & Skype for business") {
                    focus_office_365.office_365.push('Skype for Business');
                } else {
                    focus_office_365.office_365.push(parsed.name);
                }
            }   
        });
        
    
    

    //Other====>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    let other = JSON.parse(proj.json_other_focus);
        other.forEach((m) => {
            focus_other.other.push(m)   
        });
    





    // focus.push(focus_misc, focus_other, focus_windows, focus_devices, focus_dynamics_365, focus_third_party_platforms, focus_cloud_and_enterprise, focus_consumer_services, focus_office_365, focus_ai_and_research)
    if (focus_misc.miscellaneous.length > 0) focus.push(JSON.stringify(focus_misc));
    if (focus_other.other.length > 0) focus.push(JSON.stringify(focus_other));
    if (focus_windows.windows.length > 0) focus.push(JSON.stringify(focus_windows));
    if (focus_devices.devices.length > 0) focus.push(JSON.stringify(focus_devices));
    if (focus_dynamics_365.dynamics_365.length > 0) focus.push(JSON.stringify(focus_dynamics_365));
    if (focus_third_party_platforms.third_party_platforms.length > 0) focus.push(JSON.stringify(focus_third_party_platforms));
    if (focus_cloud_and_enterprise.cloud_and_enterprise.length > 0) focus.push(JSON.stringify(focus_cloud_and_enterprise));
    if (focus_consumer_services.consumer_services.length > 0) focus.push(JSON.stringify(focus_consumer_services));
    if (focus_office_365.office_365.length > 0) focus.push(JSON.stringify(focus_office_365));
    if (focus_ai_and_research.ai_and_research.length > 0) focus.push(JSON.stringify(focus_ai_and_research));

    inserts.push(updateProject(proj, focus));
    console.log(focus);



    })

    console.log('Inserts are ready: ' + inserts.length);
    Promise.all(inserts)
    .then(() => {
      console.log("Success!");
    });
  });
