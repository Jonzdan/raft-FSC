# raft-FSC

To run locally with docker compose:
* Installation all required modules (from root folder): 
    1) cd backend; npm i
    2) cd ../my-app; npm i

* Set environmental variables and secrets needed (from root folder):
    1) mkdir secrets; cd secrets
        - Desc: This folder is used by compose.yaml to populate postgres database environmental variables at build time
    2) Create relevant secret files in the /secrets/ folder and insert desired key value into them:
        - cookie_parser_key.txt
        - pg_password.txt
        - session_key.txt
    3) Create .env file: cd ~ (project root); "" > .env (create .env file)
    4) Enter the following relevant .env variables and set a value:
        - PGUSER=[any]
        - PGPASSWORD_LOCAL=[any]
        - PGHOST=postgres
        - PGPORT=5432  (Default postrgres port)
        - PGDATABASE=[any]
        - MODE=dev

* Ensure Docker Compose is installed with its engine. To spin the instance, run the following commands:
    1) "docker compose build --no-cache"
    2) "docker compose up"

* Frontend container is served at localhost:80, Backend container is served at localhost:4000.


-------------------------------------------------------------------------------------------------

To run dev environment:
* Installation all required modules (from root folder): 
    1) cd backend; npm i
    2) cd ../my-app; npm i

* Set environmental variables and secrets needed (from root folder):
    1) Create .env file: cd ~ (project root); "" > .env (create .env file)
    2) Enter the following relevant .env variables and set a value:
        - PGUSER=[any]
        - PGPASSWORD_LOCAL=[any]
        - PGHOST=postgres
        - PGPORT=5432  (Default postrgres port)
        - PGDATABASE=[any]
        - MODE=[any] != dev
        - SESSION_SECRET_KEY=[any];
        - COOKIE_PARSER_SECRET=[any];

* In two separate terminals, each in my-app (frontend) and backend folders, run the following commands:
    1) Frontend: npm run dev
    2) Backend: npm run start-backend

* Frontend served at localhost:5173; Backend served at localhost:4000.
    Note: Docker route config prefixes frontend requests with /api/.
    For local development, you may need to adjust API endpoints accordingly.
