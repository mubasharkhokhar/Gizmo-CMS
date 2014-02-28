Gizmo-CMS
=========

Gizmo CMS is a CMS providing an extensible modular architecture. This project is started in Fachhochschule Kiel as a course project M113-Advance Javascript Programming under the supervision of Prof. Dr. Robert Manzke.

Main contributors: 
1. Prakhar Shrivastava
2. Muhammad Awais Akhtar

How To Run:
========

1. Download the code.
2. Run the app.js file on NodeJS server.


Create Custom Modules
=====================
1. All modules must reside in [ node_modules/gizmo/modules/ ] folder.
2. Naming convention for the module files [ <module name>.module.js ]
3. Module will be enabled by default.
4. File code follow the same artchitecture as to create a NodeJS module.
5. hooks available "init", "menu" , "schema"

This package include 2 default themes, 
1. Admin views 
2. Default views

You can create new themes by defining them in [views] folder.

Read project documentatiion for further details.
