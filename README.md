# Secret-Santa

## Tech
Frontend - VueJS
Deployment - Heroku
Database - MongoDB
Backend - NodeJS (ExpressJS)

## Requirement
[ ] Create profiles (eg. name + photo + login for not revealing secret santa to others)
[ ] Wishlist for each profile (eg. i wanna get a Tesla)
[ ] Budget for the event (eg. 100 HKD)
[ ] Create event (eg. link for others to join)
[ ] Draw name

## Run backend on localhost
1. Change directory into `express` with `cd express/`.
2. Please install `postgres` if you haven't already, and create a database with name `DATABASE_NAME`.
3. Create a `.env` file if you haven't already and insert `DATABASE_URL=postgres://localhost/your_db_name` and replace `your_db_name` with `DATABASE_NAME` created above.
4. If you haven't install the dependencies yet, please run `npm install` in this directory.
5. Run `npm run dev` and visit [http://localhost:3000/](http://localhost:3000/).
6. If you have made changes to your frontend, please go to `../vue/` and run `npm run build`.

## Run frontend only
1. Please install `npm` or `node` if you haven't already.
2. Change directory into `vue` with `cd vue/`.
3. If you haven't install the dependencies yet, please run `npm install` in this directory.
4. Run `npm run dev` and visit [http://localhost:8080/](http://localhost:8080/).
5. Save your changes and the web app will hot-reload.

## Reference
We can refer to this [repo](https://github.com/gothinkster/vue-realworld-example-app/) for the structure during development.

