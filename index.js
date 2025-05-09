var express = require('express');
var app = express();

app.use(express.json());

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
	res.send('Hello World!');
});

app.listen(3000, function () {
	console.log('Listening on port 3000...');
});
