const Generator = require("yeoman-generator");
const recursive = require('inquirer-recursive');
const _ = require("lodash");
const mkdirp = require("mkdirp");
const path = require("path");
const process = require("process");
const packageJson = require("../package.json");

module.exports = class extends Generator {
  initializing() {
    this.env.adapter.promptModule.registerPrompt('recursive', recursive);
  }
  prompting() {
    return this.prompt([
      {
        type: "input",
        name: "name",
        message: "Your element name",
        validate: function (value) {
          if ((/([a-z]*)-([a-z]*)/).test(value)) { return true; }
          return 'name requires a hyphen and all lowercase';
        }
      },
      {
        type: "input",
        name: "author",
        message: "Author name",
        store: true
      },
      {
        type: "input",
        name: "copyrightOwner",
        message: "Copyright owner",
        store: true,
        default: "Red Hat, Inc."
      },
      {
        type: "list",
        name: "license",
        message: "What license do you want to use?",
        store: true,
        default: "apache2",
        choices: [
          {
            name: "Apache 2.0",
            value: "apache2"
          },
          {
            name: "MIT",
            value: "mit"
          },
          {
            name: "BSD 3 clause",
            value: "msd3"
          }
        ]
      },
      {
        type: "list",
        name: "useSass",
        message: "Do you want to use Sass with this element?",
        store: true,
        choices: [
          {
            name: "Yes",
            value: true
          },
          {
            name: "No",
            value: false
          }
        ]
      },
      {
        type: "list",
        name: "sassLibrary",
        when: answers => {
          return answers.useSass;
        },
        message: "Do want to use existing Sass dependencies?",
        choices: [
          {
            name: "rh-sass",
            value: {
              pkg: "@rhelements/rh-sass",
              path: "rh-sass/rh-sass"
            }
          },
          {
            name: "No thanks. I'll provide my own later",
            value: null
          }
        ]
      },
      {
        type: "list",
        name: "customElementClass",
        message: "What custom element base are you building from?",
        store: true,
        choices: [
          {
            name: "VanillaJS, pure HTMLElement",
            value: "HTMLElement"
          },
          {
            name: "RHElement",
            value: "RHElement"
          },
          {
            name: "LitElement",
            value: "LitElement"
          },
          {
            name: "Polymer (3)",
            value: "PolymerElement"
          }
        ]
      },
      {
        type: "list",
        name: "addProps",
        message: "Do you want to add properties to your custom element?",
        store: true,
        choices: [
          {
            name: "Yes",
            value: true
          },
          {
            name: "No",
            value: false
          }
        ]
      },
      /** TODO add a loop for mixing data into each of the properties */
      {
        type: 'recursive',
        message: 'Add a new property to this element ?',
        name: 'propsList',
        when: answers => {
          return answers.addProps;
        },
        prompts: [
          {
            type: 'input',
            name: 'name',
            message: "Name of the property",
            desc: "Valid examples: title, firstName, lastName, thingsAndStuff",
            validate: function (value) {
              if ((/\w/).test(value)) { return true; }
              return 'Property name must be a single word';
            }
          },
          {
            type: 'list',
            name: 'type',
            message: "What type of value is this",
            desc: "What type of value is this",
            default: "String",
            choices: [
              {
                name: "String",
                value: "String"
              },
              {
                name: "Boolean",
                value: "Boolean"
              },
              {
                name: "Number",
                value: "Number"
              },
              {
                name: "Object",
                value: "Object"
              },
              {
                name: "Array",
                value: "Array"
              },
              {
                name: "Date",
                value: "Date"
              },
            ]
          },
          {
            type: 'input',
            name: 'value',
            message: "Default value",
            desc: "leave blank for none",
          },
          {
            type: 'list',
            name: 'reflectToAttribute',
            message: "Reflect value to attribute?",
            desc: "This is useful when you want to use this value in css / theming.",
            default: false,
            choices: [
              {
                name: "No",
                value: false
              },
              {
                name: "Yes",
                value: true
              },
            ]
          },
        ]
      }
    ]).then(answers => {
      let name = answers.name.split("-")[1];

      this.props = {
        year: new Date().getFullYear(),
        author: answers.author,
        copyrightOwner: answers.copyrightOwner,
        license: answers.license,
        name: answers.name,
        elementName: answers.name,
        addProps: answers.addProps,
        propsList: answers.propsList,
        customElementClass: answers.customElementClass,
        elementClassName: _.chain(answers.name)
          .camelCase()
          .upperFirst()
          .value(),
        readmeName: _.upperFirst(name),
        lowerCaseName: name,
        camelCaseName: _.camelCase(answers.name),
        useSass: answers.useSass,
        sassLibraryPkg: false,
        sassLibraryPath: false,
        generatorRhelementVersion: packageJson.version
      };

      if (answers.useSass) {
        if (answers.sassLibrary && answers.sassLibrary.pkg) {
          this.props.sassLibraryPkg = answers.sassLibrary.pkg;
        }

        if (answers.sassLibrary && answers.sassLibrary.path) {
          this.props.sassLibraryPath = answers.sassLibrary.path;
        }
      }

      mkdirp.sync(this.props.elementName);
    });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath("package.json"),
      this.destinationPath(`${this.props.elementName}/package.json`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath(`licenses/${this.props.license}.md`),
      this.destinationPath(
        `${this.props.elementName}/LICENSE.md`
      ),
      this.props
    );
    
    this.fs.copyTpl(
      this.templatePath(`src/${this.props.customElementClass}.js`),
      this.destinationPath(
        `${this.props.elementName}/src/${this.props.elementName}.js`
      ),
      this.props
    );
    this.fs.copyTpl(
      this.templatePath(`src/properties.json`),
      this.destinationPath(
        `${this.props.elementName}/src/${this.props.elementName}-properties.json`
      ),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("README.md"),
      this.destinationPath(`${this.props.elementName}/README.md`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("gulpfile.js"),
      this.destinationPath(`${this.props.elementName}/gulpfile.js`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("demo/index.html"),
      this.destinationPath(`${this.props.elementName}/demo/index.html`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("test/element_test.html"),
      this.destinationPath(
        `${this.props.elementName}/test/${this.props.elementName}_test.html`
      ),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("test/index.html"),
      this.destinationPath(`${this.props.elementName}/test/index.html`),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath("element.story.js"),
      this.destinationPath(
        `${this.props.elementName}/${this.props.elementName}.story.js`
      ),
      this.props
    );

    this.fs.copy(
      this.templatePath(".*"),
      this.destinationPath(`${this.props.elementName}`)
    );

    if (this.props.useSass) {
      this.fs.copyTpl(
        this.templatePath("src/element.scss"),
        this.destinationPath(
          `${this.props.elementName}/src/${this.props.elementName}.scss`
        ),
        this.props
      );
    } else {
      this.fs.copy(
        this.templatePath("src/element.css"),
        this.destinationPath(`${this.props.elementName}/src/${this.props.elementName}.css`)
      )
    }

    this.fs.copy(
      this.templatePath("src/element.html"),
      this.destinationPath(`${this.props.elementName}/src/${this.props.elementName}.html`)
    );
  }

  install() {
    process.chdir(this.props.elementName);

    this.installDependencies({
      npm: true,
      bower: false,
      yarn: false
    });
  }

  end() {
    this.spawnCommand("npm", ["run", "build"]);
  }
};
