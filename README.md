# tomika-front-end
Front-end application for Tomika's website

## Installation
Install dependencies.
```
$ cd tomika-front-end
$ npm install
```
Create the `config.json` file in the `src` folder.
```
$ touch src/config.json
```
Edit the `config.json` file to include the following configuration
```json
{
	"back-end-url": "http://localhost"
}
```
* `back-end-url` URL of the back-end, without the trailing `/`.
## Usage
Start the development server. The server will run at `http://localhost:8080/`.
```
$ npm run serve
```
Build for production.
```
$ npm run build
```