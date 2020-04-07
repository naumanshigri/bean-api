"use strict";

module.exports = async function(app) {
  const Customer = app.models.Customer;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;

  Role.findOrCreate(
    { where: { name: "superAdmin" } },
    [{ name: "superAdmin" }, { name: "franchiseAdmin" }, { name: "User" }],
    function(err, role) {
      if (err) {
        console.log("\nError in Role creation", err);
      } else {
        RoleMapping.findOrCreate(
          { where: { principalId: 1 } },
          [
            {
              principalType: RoleMapping.USER,
              principalId: 1,
              roleId: 1
            }
          ],
          function(err, principal, created) {
            if (err) {
              console.log("\nError in assigning Default admin", err);
            } else {
              if (created) {
                // console.log("\nCreated a default Admin : \n", principal);
                // console.log("default admin created");
              } else {
                // console.log("default admin already created");
              }
            }
          }
        );
        // console.log("\n created roles >> \n", role);
      }
    }
  );
};

/*
  Role.find({ where: { name: "admin" } }, function(err, role) {
    if (err) console.log("\n Error in role finding:", err);
    if (!role.length) {
      Role.create(
        [{ name: "admin" }, { name: "subAdmin" }, { name: "endUser" }],
        function(err, role) {
          if (err) {
            console.log("\nError in Role creation", err);
          } else {
            console.log("\n created roles >> \n", role);
          }
        }
      );
    }
  });

  Role.find({ where: { name: "admin" } }, function(err, admin) {
    RoleMapping.find({ where: { principalId: 1 } }, function(err, roleMap) {
      if (!roleMap.length) {
        RoleMapping.create(
          [
            {
              principalType: RoleMapping.USER,
              principalId: 1,
              roleId: admin[0].id
            }
          ],
          function(err, principal) {
            if (err) {
              console.log("\nError in assigning Default admin", err);
            } else {
              console.log("\nCreated a default Admin : \n", principal);
            }
          }
        );
      }
    });
  });
  */
