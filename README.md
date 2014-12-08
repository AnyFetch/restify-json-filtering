# restify-json-filtering
> Visit http://anyfetch.com for details about AnyFetch.

This is a custom restify formatter to filter properties on JSON objects according to some custom param `fields`

## How does this work?
Let's say you have an endpoint `/search` returning the following data:

```json
{
  "count": 2,
  "next_page": "http://example.org/page3",
  "prev_path": "http://example.org/page1",
  "facets": {
    "owners": {
      "user": 0,
      "admin": 2
    },
    "creators": {
      "user": 1,
      "admin": 2
    }
  },
  "documents": [
    {
      "id": 1,
      "name": "My document",
      "snippet": "Some textual content"
    },
    {
      "id": 2,
      "name": "My other document",
      "snippet": "Some textual content"
    }
  ]
}
```

Once you setup this lib, when loading `/search?fields=count,documents.id` you'll see:

```json
{
  "count": 2,
  "documents": [
    {
      "id": 1
    },
    {
      "id": 2
    }
  ]
}
```

### Syntax
This should be a comma separated list of fields you want to retrieve.
Arrays are "ignored" (see example above).

Leaving the parameter empty will not do any filtering.
Adding a trailing `.` (dot) can be used to remove the content of an object (to count the number of items in an array without loading all the data).

## How to use

```js
var restify = require('restify');
// Replace "fields" by any name -- this will be used for the filtering data.
var restifyJsonFilterer = require('restify-json-filtering')('fields');

var server = restify.createServer({
  formatters: {
    'application/json': restifyJsonFilterer
  }
});
```

Support: `support@anyfetch.com`.
