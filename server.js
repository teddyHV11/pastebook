const express = require('express')
const app = express()
const port = 3000
const path = require('path');
let fs
const rateLimit = require('express-rate-limit')
const dataFolderPath = path.join(__dirname, 'data');

// settings

let allow_registr = process.env.allow_register // can people register (use /register, use /v1/register, etc) - disabling this will redirect these pages to 403 by default
let idsize = Number(process.env.id_size) // how much characters should IDs be
let maxaccounts = Number(process.env.maxaccounts) // max accounts that can be created per hour from an IP (this resets everytime the application is restarted)
let uses3 = process.env.uses3

if (uses3 == "true") {
  console.log("Using S3FS")
  fs = require('@cyclic.sh/s3fs') 
} else {
  console.log("Using regular FS")
  fs = require("fs");
}

try {
  if (!fs.existsSync(dataFolderPath)) {
    fs.mkdirSync(dataFolderPath);
  }

} catch(error) {
  console.log(error)
}

// API

app.get('/v1/get-pastes', (req, res) => {
    const id = req.query.id;
    const filePath = path.join(__dirname, 'data', `${id}.json`);
    if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: '404' });
        return;
    }
    const data = JSON.parse(fs.readFileSync(filePath));
    res.json(data);
});

app.get('/v1/check-if-exists', (req, res) => {
    const id = req.query.id;
    const filePath = path.join(__dirname, 'data', `${id}.json`);
    if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: '404' });
        return;
    }
    res.json("OK");
});

const createAccountLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: maxaccounts,
	message:
		'You have been ratelimited, try again later',
	standardHeaders: true,
	legacyHeaders: false,
})


app.get('/v1/new-pastebook', createAccountLimiter, (req, res) => {
  if (allow_registr == "true") {
    let id = ''
    for (let i = 0; i < idsize; i++) {
      id += Math.random().toString(36).charAt(2);
    }
    console.log(id + '..' + idsize);
    res.json({ id });
    const data = { created: new Date() };
    const filePath = path.join(__dirname, 'data', `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data));
  } else {
    res.sendFile(path.join(__dirname, 'pages/403.html'));
  }
});


app.get('/v1/add-category', (req, res) => {
  const fileId = req.query.id;
  const categoryName = req.query.name;
  const filePath = path.join(dataFolderPath, `${fileId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`File ${fileId}.json not found`);
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  let data = {};

  try {
    data = JSON.parse(fileContents);
  } catch (error) {
    return res.status(500).send(`Failed to parse ${fileId}.json: ${error.message}`);
  }

  data[categoryName] = [];

  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
  } catch (error) {
    return res.status(500).send(`Failed to write to ${fileId}.json: ${error.message}`);
  }

  res.send(`Added category ${categoryName} to ${fileId}.json`);
});

app.get('/v1/add-entry', (req, res) => {
  const fileId = req.query.id;
  const categoryName = req.query.category;
  const entry = req.query.entry;
  const filePath = path.join(dataFolderPath, `${fileId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`File ${fileId}.json not found`);
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  let data = {};

  try {
    data = JSON.parse(fileContents);
  } catch (error) {
    return res.status(500).send(`Failed to parse ${fileId}.json: ${error.message}`);
  }

  if (!data.hasOwnProperty(categoryName)) {
    return res.status(404).send(`Category ${categoryName} not found in ${fileId}.json`);
  }

  data[categoryName].push(entry);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
  } catch (error) {
    return res.status(500).send(`Failed to write to ${fileId}.json: ${error.message}`);
  }

  res.send(`Added entry ${entry} to category ${categoryName} in ${fileId}.json`);
});

app.get('/v1/delete-entry', (req, res) => {
  const fileId = req.query.id;
  const categoryName = req.query.category;
  const entry = req.query.entry;
  const filePath = path.join(dataFolderPath, `${fileId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`File ${fileId}.json not found`);
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  let data = {};

  try {
    data = JSON.parse(fileContents);
  } catch (error) {
    return res.status(500).send(`Failed to parse ${fileId}.json: ${error.message}`);
  }

  if (!data.hasOwnProperty(categoryName)) {
    return res.status(404).send(`Category ${categoryName} not found in ${fileId}.json`);
  }

  const categoryArray = data[categoryName];
  const entryIndex = categoryArray.indexOf(entry);
  if (entryIndex === -1) {
    return res.status(404).send(`Entry ${entry} not found in category ${categoryName} of ${fileId}.json`);
  }
  categoryArray.splice(entryIndex, 1);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
  } catch (error) {
    return res.status(500).send(`Failed to write to ${fileId}.json: ${error.message}`);
  }
  res.send(`Deleted entry ${entry} from category ${categoryName} in ${fileId}.json`);
});

app.get('/v1/delete-category', (req, res) => {
  const fileId = req.query.id;
  const categoryName = req.query.category;
  const filePath = path.join(dataFolderPath, `${fileId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send(`File ${fileId}.json not found`);
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  let data = {};

  try {
    data = JSON.parse(fileContents);
  } catch (error) {
    return res.status(500).send(`Failed to parse ${fileId}.json: ${error.message}`);
  }

  if (!data.hasOwnProperty(categoryName)) {
    return res.status(404).send(`Category ${categoryName} not found in ${fileId}.json`);
  }
  
  delete data[categoryName];

  try {
    fs.writeFileSync(filePath, JSON.stringify(data));
  } catch (error) {
    return res.status(500).send(`Failed to write to ${fileId}.json: ${error.message}`);
  }
  
  res.send(`Deleted category ${categoryName} from ${fileId}.json`);
});

// WEB HANDLING

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'pages/frontpage.html'));
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, 'pages/login.html'));
});

app.get('/register', function(req, res) {
  if (allow_registr == "true") {
  res.sendFile(path.join(__dirname, 'pages/register.html'));
  } else {
    res.sendFile(path.join(__dirname, 'pages/403.html'));
  }
});

app.get('/panel', function(req, res) {
  res.sendFile(path.join(__dirname, 'pages/panel.html'));
});

// asset files
app.get('/css-1', function(req, res) { //this one is used in the default and error pages
  res.sendFile(path.join(__dirname, 'pages/css/regular.css')); 
});

app.get('/css-2', function(req, res) { // used /w login and register
  res.sendFile(path.join(__dirname, 'pages/css/login-register.css'));
});

app.get('/css-3', function(req, res) { // panel CSS
  res.sendFile(path.join(__dirname, 'pages/css/panel.css'));
});

app.get('/redirect', function(req, res) {
  res.sendFile(path.join(__dirname, 'pages/js/redirect.js'));
});

app.get('/loginjs', function(req, res) {
  res.sendFile(path.join(__dirname, 'pages/js/login.js'));
});

app.get('/paneljs', function(req, res) {
  res.sendFile(path.join(__dirname, 'pages/js/panel.js'));
});

app.get('/entriesjs', function(req, res) {
  res.sendFile(path.join(__dirname, 'pages/js/entries.js'));
});

// Error Codes

app.use(function(req,res){
    res.status(404).sendFile(path.join(__dirname, 'pages/404.html'));
});

app.listen(port, () => {
  
})