# Vue create example

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Nodejs

Install Nodejs from [their website](https://nodejs.org/en)

## Project Setup

Whenever you clone this project, or change the contents of `package.json`, be sure to run this command in your terminal:

```sh
npm install
```

### Compile and Hot-Reload for Development

Whenever you want to run the local development server, which will allow you to view the application in your browser, run this command in your terminal:

```sh
npm run dev
```

### Compile and Minify for Production

Whenever you want to create the files that you would serve in a production environment (like Amazon S3), run this command in your terminal:

```sh
npm run build
```

## About This Template

The source code for this project lives primarily in the `src` directory, as well as the `index.html` file.

Vite uses the `index.html` file as its entrypoint. The file contains a `<script>` tag linking to `src/main.js`, which is the entrypoint into our vue application. That file imports `src/assets/main.css`, which tells Vite to link up that CSS file to the html file when building for production.

> **Note**
> While we of course can use a `<link>` tag in our HTML instead of an `import` statement in our Javascript, if we were to import multiple css files, Vite would be able to efficiently combine the css files when using `import` statements, but not `<link>` tags

### Points of Interest

- `src/router/index.js`

  This file configures the routing for this application. It imports each of the views of the app from the views directory, and associates them to a name and a path.

- `src/App.vue`

  This is the root component of the application, the component that is mounted directly onto the page after all child components have been mounted to it. It controls the top-most structure of the UI and the vue app's behavior

- `src/components/AppHeader.vue`

  This is a component that renders the app's header and navigation. It is used in `src/App.vue`, and is kept outside of the views because it does not change from view to view.

Most files should have useful comments in them describing what is being done by a line or set of lines.
