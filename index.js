var express = require('express');
var app = express();

app.use(express.json());
app.use(express.static('public'));

// Basic Authentication Middleware
function basicAuth(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		res.set('WWW-Authenticate', 'Basic realm="Access to API"');
		return res.status(401).json({ message: 'Authentication required' });
	}

	const base64Credentials = authHeader.split(' ')[1];
	const credentials = Buffer.from(base64Credentials, 'base64').toString(
		'ascii'
	);
	const [username, password] = credentials.split(':');

	// Very simple authentication
	if (username === 'admin' && password === 'password123') {
		req.user = { username };
		return next();
	}

	res.set('WWW-Authenticate', 'Basic realm="Access to API"');
	return res
		.status(401)
		.json({ message: 'Invalid authentication credentials' });
}

// In-memory data store for testing
const items = [
	{ id: 1, name: 'Item 1', description: 'This is the first item' },
	{ id: 2, name: 'Item 2', description: 'This is the second item' },
];

app.use('/api', basicAuth);

app.get('/api/items', function (req, res) {
	res.json(items);
});

app.get('/api/items/:id', function (req, res) {
	const id = parseInt(req.params.id);
	const item = items.find((item) => item.id === id);

	if (!item) {
		return res.status(404).json({ message: 'Item not found' });
	}

	res.json(item);
});

app.post('/api/items', function (req, res) {
	const newItem = {
		id: items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1,
		name: req.body.name,
		description: req.body.description,
	};

	items.push(newItem);
	res.status(201).json(newItem);
});

app.put('/api/items/:id', function (req, res) {
	const id = parseInt(req.params.id);
	const itemIndex = items.findIndex((item) => item.id === id);

	if (itemIndex === -1) {
		return res.status(404).json({ message: 'Item not found' });
	}

	const updatedItem = {
		id: id,
		name: req.body.name || items[itemIndex].name,
		description: req.body.description || items[itemIndex].description,
	};

	items[itemIndex] = updatedItem;
	res.json(updatedItem);
});

app.delete('/api/items/:id', function (req, res) {
	const id = parseInt(req.params.id);
	const itemIndex = items.findIndex((item) => item.id === id);

	if (itemIndex === -1) {
		return res.status(404).json({ message: 'Item not found' });
	}

	items.splice(itemIndex, 1);
	res.status(204).send();
});

app.get('/', function (req, res) {
	res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Pizza Paul and Mary</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Rubik+Mono+One&family=Rubik+Puddles&family=Rubik:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Rubik', sans-serif;
            text-align: center;
            margin: 0;
            padding: 0;
            background-color: #FFF3C7;
            color: #F22C79;
          }
          
          .header {
            background-color: #F22C79;
            color: #FFF3C7;
            padding: 20px;
            font-family: 'Rubik Mono One', sans-serif;
            letter-spacing: 2px;
          }
          
          .header h1 {
            font-size: 3.5rem;
            margin: 0;
            text-transform: uppercase;
          }
          
          img {
            max-width: 100%;
            border-radius: 20px;
            border: 8px solid #F22C79;
            margin: 30px 0;
          }
          
          .container {
            width: 85%;
            max-width: 700px;
            margin: 0 auto;
            padding: 30px;
          }
          
          h2 {
            font-family: 'Rubik Puddles', cursive;
            font-size: 2.5rem;
            color: #6C4BF6;
            margin-bottom: 30px;
          }
          
          p {
            font-size: 1.2rem;
            line-height: 1.8;
            color: #333;
          }
          
          .api-info {
            background-color: #6C4BF6;
            color: white;
            padding: 20px;
            border-radius: 15px;
            margin: 30px 0;
          }
          
          .api-info p {
            color: white;
          }
          
          code {
            background-color: #F22C79;
            color: white;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: monospace;
          }
          
          .wavy-border {
            height: 30px;
            background: #F22C79;
            background-image: 
              radial-gradient(circle at 15px -5px, transparent 20px, #FFF3C7 20px);
            background-size: 30px 30px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Pizza Paul & Mary</h1>
        </div>
        
        <div class="wavy-border"></div>
        
        <div class="container">
          <img src="/pizza.jpg" alt="Pizza Paul and Mary">
          <h2>Groovy Pizza API</h2>
          <p>Welcome to our far-out Express application with totally rad RESTful API endpoints.</p>
          
          <div class="api-info">
            <p>Use Basic Authentication with username and password to access the API.</p>
            <p>Dig our API endpoints at <code>/api/items</code>.</p>
          </div>
          
          <p>Peace, love, and pizza, man! ✌️</p>
        </div>
      </body>
    </html>
  `);
});

app.listen(3000, function () {
	console.log('Listening on port 3000...');
});
